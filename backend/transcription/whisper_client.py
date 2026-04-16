"""
Whisper transcription fallback using faster-whisper (CTranslate2 backend).

Used only when Deepgram's word-level confidence falls below the configured
threshold.  faster-whisper runs locally — no extra API key required.

Model is loaded lazily and cached for the process lifetime.
"""
from __future__ import annotations

import asyncio
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING, Any

from structlog import get_logger

from backend.models.domain import TranscriptSegment, TranscriptionResult

if TYPE_CHECKING:
    from backend.core.config import Settings

logger = get_logger(__name__)


class WhisperTranscriptionService:
    """Local Whisper transcription via faster-whisper."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._model = None  # lazy-loaded

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def is_available(self) -> bool:
        try:
            import faster_whisper  # noqa: F401
            return True
        except ImportError:
            return False

    async def transcribe_file(self, audio_path: Path) -> TranscriptionResult:
        """Transcribe a local audio file (non-blocking — runs in executor)."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._transcribe_sync, audio_path)

    async def transcribe_bytes(
        self,
        audio_bytes: bytes,
        *,
        suffix: str = ".wav",
    ) -> TranscriptionResult:
        """Write bytes to a temp file and transcribe."""
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = Path(tmp.name)
        try:
            return await self.transcribe_file(tmp_path)
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    def _load_model(self):
        if self._model is not None:
            return self._model

        from faster_whisper import WhisperModel

        model_size = self.settings.whisper_model
        compute_type = self.settings.whisper_compute_type
        device = self.settings.whisper_device

        logger.info(
            "loading_whisper_model",
            model=model_size,
            device=device,
            compute_type=compute_type,
        )
        self._model = WhisperModel(
            model_size,
            device=device,
            compute_type=compute_type,
        )
        logger.info("whisper_model_loaded", model=model_size)
        return self._model

    def _transcribe_sync(self, audio_path: Path) -> TranscriptionResult:
        model = self._load_model()

        logger.info("whisper_transcription_start", path=str(audio_path))

        segments_iter, info = model.transcribe(
            str(audio_path),
            beam_size=self.settings.whisper_beam_size,
            best_of=self.settings.whisper_best_of,
            language=None,           # always auto-detect
            vad_filter=True,         # skip non-speech frames
            vad_parameters=dict(
                min_silence_duration_ms=300,
                speech_pad_ms=400,
            ),
            word_timestamps=True,    # needed for no-word-skipping guarantee
            condition_on_previous_text=True,
            temperature=0.0,         # greedy — most deterministic
        )

        language = info.language or "und"
        language_confidence = float(info.language_probability or 0.0)

        raw_words: list[dict[str, Any]] = []
        segments: list[TranscriptSegment] = []
        full_text_parts: list[str] = []

        for seg in segments_iter:
            seg_text = (seg.text or "").strip()
            if not seg_text:
                continue

            full_text_parts.append(seg_text)

            # Collect word-level tokens
            words = seg.words or []
            for w in words:
                raw_words.append({
                    "word": w.word.strip(),
                    "punctuated_word": w.word.strip(),
                    "start": float(w.start),
                    "end": float(w.end),
                    "confidence": float(w.probability),
                })

            segments.append(
                TranscriptSegment(
                    speaker="Speaker 1",   # Whisper has no diarization
                    text=seg_text,
                    start=float(seg.start),
                    end=float(seg.end),
                )
            )

        transcript_text = " ".join(full_text_parts).strip()

        # Compute average word confidence
        if raw_words:
            avg_conf = sum(w["confidence"] for w in raw_words) / len(raw_words)
        else:
            avg_conf = language_confidence

        logger.info(
            "whisper_transcription_complete",
            language=language,
            language_confidence=language_confidence,
            word_count=len(raw_words),
            avg_word_confidence=round(avg_conf, 4),
            segments=len(segments),
        )

        return TranscriptionResult(
            transcript_text=transcript_text,
            language=language,
            language_confidence=language_confidence,
            segments=segments,
            raw_response={
                "whisper": True,
                "model": self.settings.whisper_model,
                "language": language,
                "language_probability": language_confidence,
                "avg_word_confidence": avg_conf,
            },
            raw_words=raw_words,
        )
