from __future__ import annotations

from collections import OrderedDict
from typing import Any

import httpx
from structlog import get_logger

from backend.core.config import Settings
from backend.language import analyze_segment_languages, detect_text_language, normalize_language_code
from backend.models.domain import TranscriptSegment, TranscriptionResult

logger = get_logger(__name__)


class DeepgramTranscriptionService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def _request_params(
        self,
        model: str,
        language: str | None = None,
        *,
        diarize: bool = True,
    ) -> dict[str, str]:
        params: dict[str, str] = {
            "model": model,
            "punctuate": "true",
            "smart_format": "true",
            "detect_language": "true",
            # utterances always on — gives us speaker-tagged sentence blocks
            # even when diarize=False, and lets us reconstruct any missed words
            "utterances": "true",
        }
        if diarize:
            params["diarize"] = "true"
            params["paragraphs"] = "true"
        # Word-level timestamps are always requested so the word-gap filler
        # and the Whisper confidence comparator can operate on every token.
        if language and normalize_language_code(language) != "und":
            params["language"] = normalize_language_code(language)
        return params

    async def transcribe_audio(
        self,
        audio_bytes: bytes,
        mime_type: str = "application/octet-stream",
        *,
        diarize: bool = True,
        language: str | None = None,
    ) -> TranscriptionResult:
        if not self.settings.deepgram_api_key:
            raise RuntimeError("DEEPGRAM_API_KEY is not configured")
        headers = {
            "Authorization": f"Token {self.settings.deepgram_api_key}",
            "Content-Type": mime_type,
        }
        return await self._transcribe_with_language_recovery(
            headers=headers,
            content=audio_bytes,
            json_body=None,
            diarize=diarize,
            forced_language=language,
        )

    async def transcribe_url(
        self,
        media_url: str,
        *,
        diarize: bool = True,
        language: str | None = None,
    ) -> TranscriptionResult:
        if not self.settings.deepgram_api_key:
            raise RuntimeError("DEEPGRAM_API_KEY is not configured")
        headers = {
            "Authorization": f"Token {self.settings.deepgram_api_key}",
            "Content-Type": "application/json",
        }
        return await self._transcribe_with_language_recovery(
            headers=headers,
            content=None,
            json_body={"url": media_url},
            diarize=diarize,
            forced_language=language,
        )

    async def _transcribe_with_language_recovery(
        self,
        *,
        headers: dict[str, str],
        content: bytes | None,
        json_body: dict[str, Any] | None,
        diarize: bool = True,
        forced_language: str | None = None,
    ) -> TranscriptionResult:
        # If the user explicitly chose a language, use it directly and skip
        # the language-recovery loop — no need to auto-detect or try candidates.
        explicit_lang = normalize_language_code(forced_language) if forced_language else None
        if explicit_lang and explicit_lang != "und":
            payload = await self._call_deepgram_with_model_fallback(
                headers=headers,
                content=content,
                json_body=json_body,
                forced_language=explicit_lang,
                diarize=diarize,
            )
            result = self._normalize_result(payload, diarize=diarize)
            if result.language in (None, "und", ""):
                result.language = explicit_lang
            return result

        payload = await self._call_deepgram_with_model_fallback(
            headers=headers,
            content=content,
            json_body=json_body,
            forced_language=None,
            diarize=diarize,
        )
        primary_result = self._normalize_result(payload, diarize=diarize)

        if not self._should_attempt_language_recovery(primary_result):
            return primary_result

        candidates = self._recovery_candidates(primary_result)
        if not candidates:
            return primary_result

        primary_language = normalize_language_code(primary_result.language)
        primary_score = self._result_quality_score(primary_result, expected_language=primary_language)
        best_result = primary_result
        best_score = primary_score

        for candidate_language in candidates:
            try:
                hinted_payload = await self._call_deepgram_with_model_fallback(
                    headers=headers,
                    content=content,
                    json_body=json_body,
                    forced_language=candidate_language,
                    diarize=diarize,
                )
                hinted_result = self._normalize_result(hinted_payload, diarize=diarize)
                hinted_result.language = normalize_language_code(hinted_result.language)
                if hinted_result.language == "und":
                    hinted_result.language = candidate_language
                score = self._result_quality_score(hinted_result, expected_language=candidate_language)
                logger.info(
                    "deepgram_language_recovery_attempt",
                    candidate_language=candidate_language,
                    primary_score=primary_score,
                    candidate_score=score,
                    candidate_detected_language=hinted_result.language,
                    candidate_detected_confidence=hinted_result.language_confidence,
                )
                if score > best_score:
                    best_result = hinted_result
                    best_score = score
            except Exception as exc:
                logger.warning(
                    "deepgram_language_recovery_failed",
                    candidate_language=candidate_language,
                    error=str(exc),
                )

        if best_result is not primary_result and best_score >= int(primary_score * 1.05):
            logger.info(
                "deepgram_language_recovery_selected",
                primary_language=primary_language,
                selected_language=best_result.language,
                primary_score=primary_score,
                selected_score=best_score,
            )
            return best_result

        return primary_result

    async def _call_deepgram_with_model_fallback(
        self,
        *,
        headers: dict[str, str],
        content: bytes | None = None,
        json_body: dict[str, Any] | None = None,
        forced_language: str | None = None,
        diarize: bool = True,
    ) -> dict[str, Any]:
        api_keys = self.settings.deepgram_api_key_list
        models = self._model_candidates()
        last_error: Exception | None = None

        for key_idx, api_key in enumerate(api_keys):
            # Inject the current key into headers (Content-Type etc. stay the same)
            current_headers = {**headers, "Authorization": f"Token {api_key}"}
            key_exhausted = False

            for model in models:
                params = self._request_params(model=model, language=forced_language, diarize=diarize)
                try:
                    payload = await self._call_deepgram(
                        params=params,
                        headers=current_headers,
                        content=content,
                        json_body=json_body,
                    )
                    if key_idx > 0:
                        logger.info(
                            "deepgram_key_rotation_succeeded",
                            key_index=key_idx,
                            model=model,
                        )
                    logger.info(
                        "deepgram_transcription_model_success",
                        model=model,
                        forced_language=forced_language,
                    )
                    return payload
                except httpx.HTTPStatusError as exc:
                    last_error = exc
                    detail = self._http_error_detail(exc)
                    status = exc.response.status_code
                    logger.warning(
                        "deepgram_transcription_model_failed",
                        model=model,
                        forced_language=forced_language,
                        status_code=status,
                        error=detail,
                    )
                    if status in (429, 401, 403):
                        # Key is rate-limited or invalid — try next key
                        logger.warning(
                            "deepgram_api_key_failed_rotating",
                            key_index=key_idx,
                            status=status,
                            keys_remaining=len(api_keys) - key_idx - 1,
                        )
                        key_exhausted = True
                        break  # stop trying models with this key
                    if status not in {400, 404, 422}:
                        raise RuntimeError(f"Deepgram transcription failed: {detail}") from exc
                    # 400/404/422 → try next model
                except Exception as exc:
                    last_error = exc
                    logger.warning(
                        "deepgram_transcription_model_failed",
                        model=model,
                        forced_language=forced_language,
                        error=str(exc),
                    )

            if not key_exhausted:
                # All models tried and none succeeded for a non-key reason —
                # a different key won't help, stop here.
                break

        if isinstance(last_error, httpx.HTTPStatusError):
            detail = self._http_error_detail(last_error)
            raise RuntimeError(
                f"Deepgram transcription failed for all models/keys: {detail}",
            ) from last_error
        if last_error:
            raise RuntimeError(
                f"Deepgram transcription failed for all models/keys: {str(last_error)}",
            ) from last_error
        raise RuntimeError(f"Deepgram transcription failed for all models ({', '.join(models)})")

    def _model_candidates(self) -> list[str]:
        candidates = [
            (self.settings.deepgram_model or "").strip(),
            "nova-3",
            "nova-2",
        ]
        seen: set[str] = set()
        ordered: list[str] = []
        for candidate in candidates:
            if not candidate or candidate in seen:
                continue
            seen.add(candidate)
            ordered.append(candidate)
        return ordered

    async def _call_deepgram(
        self,
        *,
        params: dict[str, str],
        headers: dict[str, str],
        content: bytes | None = None,
        json_body: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        timeout = httpx.Timeout(
            timeout=self.settings.deepgram_timeout_seconds,
            connect=min(30.0, self.settings.deepgram_timeout_seconds),
        )
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    "https://api.deepgram.com/v1/listen",
                    params=params,
                    headers=headers,
                    content=content,
                    json=json_body,
                )
        except httpx.TimeoutException as exc:
            raise RuntimeError(
                f"Deepgram transcription timed out after {self.settings.deepgram_timeout_seconds:.0f}s"
            ) from exc
        response.raise_for_status()
        return response.json()

    @staticmethod
    def _http_error_detail(error: httpx.HTTPStatusError) -> str:
        try:
            body = error.response.text.strip()
            if body:
                return body
        except Exception:
            pass
        return str(error)

    def _normalize_result(
        self,
        payload: dict[str, Any],
        *,
        diarize: bool = True,
    ) -> TranscriptionResult:
        results = payload.get("results", {})
        alternatives = results.get("channels", [{}])[0].get("alternatives", [{}])[0]
        utterances = results.get("utterances") or alternatives.get("utterances") or []
        transcript_text = (alternatives.get("transcript") or "").strip()
        language, language_confidence = self._extract_language_info(results=results, alternatives=alternatives)
        language = language or "und"
        logger.info("detected_language", language=language, confidence=language_confidence)

        # Always extract raw words — the hybrid aligner needs them even when
        # Deepgram diarization is disabled.
        raw_words: list[dict[str, Any]] = list(alternatives.get("words") or [])

        speaker_map: OrderedDict[int, str] = OrderedDict()
        segments: list[TranscriptSegment] = []

        if diarize:
            # Use Deepgram's own diarization output (utterances → paragraphs → words)
            segments = self._segments_from_utterances(utterances=utterances, speaker_map=speaker_map)

            if not segments:
                paragraphs = (
                    alternatives.get("paragraphs", {}).get("paragraphs")
                    if isinstance(alternatives.get("paragraphs"), dict)
                    else []
                ) or []
                segments = self._segments_from_paragraphs(paragraphs=paragraphs, speaker_map=speaker_map)

            if not segments:
                segments = self._segments_from_words(words=raw_words, speaker_map=speaker_map)

        # When diarize=False (hybrid mode), leave segments empty here —
        # session_processing will fill them via the pyannote aligner.

        if not segments and transcript_text:
            segments = [
                TranscriptSegment(
                    speaker="Speaker 1",
                    text=transcript_text,
                    start=0.0,
                    end=0.0,
                )
            ]

        # Ensure no words are skipped: rebuild transcript_text from raw_words
        # if it is shorter than what the word list implies.
        if raw_words:
            words_text = " ".join(
                (w.get("punctuated_word") or w.get("word") or "").strip()
                for w in raw_words
                if (w.get("punctuated_word") or w.get("word") or "").strip()
            )
            # Use word-derived text when it is meaningfully longer (>5 chars)
            if len(words_text) > len(transcript_text) + 5:
                logger.info(
                    "deepgram_transcript_gap_filled",
                    original_len=len(transcript_text),
                    filled_len=len(words_text),
                )
                transcript_text = words_text

        if not transcript_text and segments:
            transcript_text = " ".join(segment.text for segment in segments)

        return TranscriptionResult(
            transcript_text=transcript_text,
            language=language,
            language_confidence=language_confidence,
            segments=segments,
            raw_response=payload,
            raw_words=raw_words,
        )

    def _should_attempt_language_recovery(self, result: TranscriptionResult) -> bool:
        confidence_threshold = min(1.0, max(0.0, self.settings.language_detection_confidence_threshold))
        dominance_threshold = min(1.0, max(0.5, self.settings.language_dominance_threshold))

        detected_language = normalize_language_code(result.language)
        detected_confidence = float(result.language_confidence or 0.0)
        segment_stats = analyze_segment_languages(result.segments)
        transcript_decision = detect_text_language(result.transcript_text)
        transcript_language = normalize_language_code(transcript_decision.language)

        low_confidence = detected_confidence < confidence_threshold
        mixed_transcript = segment_stats.dominant_share < dominance_threshold
        transcript_conflict = (
            transcript_language != "und"
            and detected_language != "und"
            and transcript_decision.confidence >= 0.7
            and transcript_language != detected_language
        )

        should_recover = low_confidence or mixed_transcript or transcript_conflict
        if should_recover:
            logger.info(
                "deepgram_language_recovery_triggered",
                detected_language=detected_language,
                detected_confidence=detected_confidence,
                dominant_language=segment_stats.dominant_language,
                dominant_share=segment_stats.dominant_share,
                transcript_language=transcript_language,
                transcript_language_confidence=transcript_decision.confidence,
                reason={
                    "low_confidence": low_confidence,
                    "mixed_transcript": mixed_transcript,
                    "transcript_conflict": transcript_conflict,
                },
            )
        return should_recover

    def _recovery_candidates(self, result: TranscriptionResult) -> list[str]:
        ordered: list[str] = []
        seen: set[str] = set()

        def add(code: str | None) -> None:
            normalized = normalize_language_code(code)
            if normalized == "und" or normalized in seen:
                return
            seen.add(normalized)
            ordered.append(normalized)

        transcript_decision = detect_text_language(result.transcript_text)
        if transcript_decision.confidence >= self.settings.language_detection_confidence_threshold:
            add(transcript_decision.language)

        add(result.language)

        raw = (self.settings.deepgram_recovery_languages or "").strip()
        if raw:
            for item in raw.split(","):
                add(item.strip())

        max_candidates = max(1, int(self.settings.deepgram_recovery_max_candidates))
        return ordered[:max_candidates]

    def _result_quality_score(self, result: TranscriptionResult, expected_language: str) -> int:
        expected = normalize_language_code(expected_language)
        text_len = len((result.transcript_text or "").strip())
        if text_len == 0:
            return 0

        detected = normalize_language_code(result.language)
        detected_text = detect_text_language(result.transcript_text)
        detected_text_lang = normalize_language_code(detected_text.language)
        segment_stats = analyze_segment_languages(result.segments)
        word_conf = self._word_confidence(result.raw_response)

        score = text_len
        score += int(word_conf * 1000)

        if expected != "und":
            if detected == expected:
                score += 350
            if detected_text_lang == expected:
                score += int(350 * max(0.0, min(1.0, detected_text.confidence)))
            if normalize_language_code(segment_stats.dominant_language) == expected:
                score += int(700 * max(0.0, min(1.0, segment_stats.dominant_share)))
            else:
                score -= 250

        if segment_stats.dominant_share < 0.5:
            score -= 300

        return max(0, score)

    @staticmethod
    def _word_confidence(payload: dict[str, Any]) -> float:
        try:
            words = payload.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("words", [])
        except Exception:
            words = []
        if not isinstance(words, list) or not words:
            return 0.5
        confidences: list[float] = []
        for word in words[:1000]:
            try:
                confidence = float(word.get("confidence"))
            except Exception:
                continue
            if 0.0 <= confidence <= 1.0:
                confidences.append(confidence)
        if not confidences:
            return 0.5
        return sum(confidences) / len(confidences)

    @staticmethod
    def _extract_language_info(
        *,
        results: dict[str, Any],
        alternatives: dict[str, Any],
    ) -> tuple[str | None, float | None]:
        def first_float(*values: Any) -> float | None:
            for value in values:
                parsed = DeepgramTranscriptionService._to_float(value)
                if parsed is not None:
                    return parsed
            return None

        language = (
            alternatives.get("detected_language")
            or alternatives.get("language")
            or results.get("detected_language")
            or results.get("language")
        )
        confidence = first_float(
            alternatives.get("detected_language_confidence"),
            alternatives.get("language_confidence"),
            results.get("detected_language_confidence"),
            results.get("language_confidence"),
        )

        alt_lang, alt_conf = DeepgramTranscriptionService._language_from_alternatives_payload(alternatives)
        if not language:
            language = alt_lang or language
        if confidence is None and alt_conf is not None:
            confidence = alt_conf

        res_lang, res_conf = DeepgramTranscriptionService._language_from_alternatives_payload(results)
        if not language:
            language = res_lang or language
        if confidence is None and res_conf is not None:
            confidence = res_conf

        return (
            str(language).strip().lower() if isinstance(language, str) and language.strip() else None,
            confidence,
        )

    @staticmethod
    def _language_from_alternatives_payload(container: dict[str, Any]) -> tuple[str | None, float | None]:
        languages = container.get("languages") or container.get("detected_languages") or []
        if not isinstance(languages, list) or not languages:
            return None, None
        first = languages[0]
        if isinstance(first, str):
            language = first.strip().lower()
            return (language or None), None
        if not isinstance(first, dict):
            return None, None
        language = first.get("language") or first.get("code")
        confidence = DeepgramTranscriptionService._to_float(first.get("confidence"))
        if not language:
            return None, confidence
        language_normalized = str(language).strip().lower()
        return (language_normalized or None), confidence

    @staticmethod
    def _to_float(value: Any) -> float | None:
        if value is None:
            return None
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _parse_speaker_number(value: Any) -> int:
        try:
            return int(float(value))
        except (TypeError, ValueError):
            return 0

    @staticmethod
    def _segments_from_utterances(
        *,
        utterances: list[dict[str, Any]],
        speaker_map: OrderedDict[int, str],
    ) -> list[TranscriptSegment]:
        segments: list[TranscriptSegment] = []
        for utterance in utterances:
            text = (utterance.get("transcript") or "").strip()
            if not text:
                continue

            speaker_num = DeepgramTranscriptionService._parse_speaker_number(
                utterance.get("speaker", 0),
            )
            if speaker_num not in speaker_map:
                speaker_map[speaker_num] = f"Speaker {len(speaker_map) + 1}"

            segments.append(
                TranscriptSegment(
                    speaker=speaker_map[speaker_num],
                    text=text,
                    start=float(utterance.get("start", 0.0)),
                    end=float(utterance.get("end", 0.0)),
                )
            )
        return segments

    @staticmethod
    def _segments_from_words(
        *,
        words: list[dict[str, Any]],
        speaker_map: OrderedDict[int, str],
    ) -> list[TranscriptSegment]:
        segments: list[TranscriptSegment] = []
        current_speaker_num: int | None = None
        current_words: list[str] = []
        current_start = 0.0
        current_end = 0.0

        def flush() -> None:
            nonlocal current_speaker_num, current_words, current_start, current_end
            if current_speaker_num is None or not current_words:
                return
            if current_speaker_num not in speaker_map:
                speaker_map[current_speaker_num] = f"Speaker {len(speaker_map) + 1}"
            segments.append(
                TranscriptSegment(
                    speaker=speaker_map[current_speaker_num],
                    text=" ".join(current_words).strip(),
                    start=current_start,
                    end=current_end,
                )
            )
            current_words = []
            current_speaker_num = None
            current_start = 0.0
            current_end = 0.0

        for word in words:
            punctuated = (word.get("punctuated_word") or word.get("word") or "").strip()
            if not punctuated:
                continue

            speaker_num = DeepgramTranscriptionService._parse_speaker_number(
                word.get("speaker", 0),
            )
            start = float(word.get("start", 0.0))
            end = float(word.get("end", start))

            if current_speaker_num is None:
                current_speaker_num = speaker_num
                current_start = start
            elif speaker_num != current_speaker_num:
                flush()
                current_speaker_num = speaker_num
                current_start = start

            current_words.append(punctuated)
            current_end = end

        flush()
        return segments

    @staticmethod
    def _segments_from_paragraphs(
        *,
        paragraphs: list[dict[str, Any]],
        speaker_map: OrderedDict[int, str],
    ) -> list[TranscriptSegment]:
        segments: list[TranscriptSegment] = []
        for paragraph in paragraphs:
            text = (paragraph.get("text") or "").strip()
            if not text:
                sentence_texts: list[str] = []
                for sentence in paragraph.get("sentences", []) or []:
                    sentence_value = (sentence.get("text") or "").strip()
                    if sentence_value:
                        sentence_texts.append(sentence_value)
                text = " ".join(sentence_texts).strip()
            if not text:
                continue

            speaker_num = DeepgramTranscriptionService._parse_speaker_number(
                paragraph.get("speaker", 0),
            )
            if speaker_num not in speaker_map:
                speaker_map[speaker_num] = f"Speaker {len(speaker_map) + 1}"

            segments.append(
                TranscriptSegment(
                    speaker=speaker_map[speaker_num],
                    text=text,
                    start=float(paragraph.get("start", 0.0)),
                    end=float(paragraph.get("end", 0.0)),
                )
            )
        return segments
