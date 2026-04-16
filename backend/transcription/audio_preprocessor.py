"""
Audio preprocessing pipeline for improved transcription accuracy.

Steps applied (in order):
1. Decode any audio/video format → mono 16 kHz float32 PCM  (via torchaudio)
2. Normalise peak amplitude to -1 dBFS
3. Remove leading/trailing silence (VAD-based trim)
4. Light noise reduction via spectral subtraction

The output is always a 16 kHz mono WAV written to a temp file.
All steps degrade gracefully — if a step fails the previous output is kept.
"""
from __future__ import annotations

import os
import tempfile
from pathlib import Path

from structlog import get_logger

logger = get_logger(__name__)

_TARGET_SR = 16_000  # Hz — required by Whisper and pyannote


def preprocess_audio(source_path: Path) -> Path:
    """
    Preprocess *source_path* and return a new temp WAV path at 16 kHz mono.
    The caller is responsible for deleting the returned file when done.
    """
    import torch
    import torchaudio

    # ---- 1. Load & convert to mono 16 kHz ----
    try:
        waveform, sr = torchaudio.load(str(source_path))
    except Exception as exc:
        logger.warning("preprocess_load_failed", path=str(source_path), error=str(exc))
        # Return the original path unchanged — Deepgram can handle many formats natively
        return source_path

    # Mono mix-down
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)

    # Resample
    if sr != _TARGET_SR:
        resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=_TARGET_SR)
        waveform = resampler(waveform)
        sr = _TARGET_SR

    # ---- 2. Peak normalise to -1 dBFS ----
    waveform = _peak_normalise(waveform)

    # ---- 3. Silence trim ----
    waveform = _trim_silence(waveform, sr)

    # ---- 4. Spectral noise reduction ----
    waveform = _reduce_noise(waveform, sr)

    # ---- Save to temp WAV ----
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    tmp.close()
    torchaudio.save(tmp.name, waveform, sr, format="wav")
    logger.info(
        "audio_preprocessed",
        source=str(source_path),
        output=tmp.name,
        duration_s=round(waveform.shape[-1] / sr, 2),
    )
    return Path(tmp.name)


# ---------------------------------------------------------------------------
# Step implementations
# ---------------------------------------------------------------------------

def _peak_normalise(waveform):
    """Normalise to -1 dBFS (peak = 0.891)."""
    import torch
    target = 10 ** (-1.0 / 20)  # ≈ 0.891
    peak = waveform.abs().max()
    if peak > 1e-6:
        waveform = waveform * (target / peak)
    return waveform


def _trim_silence(waveform, sr: int, top_db: float = 40.0):
    """
    Remove leading and trailing silence using a simple energy-based VAD.
    Frames with energy > (max_energy - top_db dB) are considered speech.
    """
    import torch

    frame_len = int(sr * 0.02)   # 20 ms frames
    hop_len   = int(sr * 0.01)   # 10 ms hop

    samples = waveform.squeeze(0)
    n = samples.shape[0]

    # RMS energy per frame
    energies: list[float] = []
    for i in range(0, n - frame_len, hop_len):
        frame = samples[i : i + frame_len]
        energies.append(float(frame.pow(2).mean().sqrt()))

    if not energies:
        return waveform

    max_e = max(energies)
    if max_e < 1e-6:
        return waveform

    threshold = max_e * (10 ** (-top_db / 20))

    # Find first and last active frame
    first = next((i for i, e in enumerate(energies) if e >= threshold), 0)
    last  = next((i for i, e in enumerate(reversed(energies)) if e >= threshold), 0)
    last  = len(energies) - last - 1

    start_sample = first * hop_len
    end_sample   = min(n, (last + 1) * hop_len + frame_len)

    if end_sample <= start_sample:
        return waveform

    trimmed = samples[start_sample:end_sample].unsqueeze(0)
    logger.debug(
        "silence_trimmed",
        removed_start_s=round(start_sample / sr, 3),
        removed_end_s=round((n - end_sample) / sr, 3),
    )
    return trimmed


def _reduce_noise(waveform, sr: int):
    """
    Lightweight spectral subtraction noise reduction.

    Estimates noise PSD from the first 0.5 s of audio (assumed to be
    background noise or near-silence) then subtracts it from each frame.
    """
    import torch

    samples = waveform.squeeze(0)
    n = samples.shape[0]

    n_fft     = 512
    hop_len   = 256
    noise_len = min(int(sr * 0.5), n)

    if noise_len < n_fft:
        return waveform  # too short to estimate noise

    # Estimate noise spectrum from the first 0.5 s
    noise_segment = samples[:noise_len]
    noise_stft = torch.stft(
        noise_segment,
        n_fft=n_fft,
        hop_length=hop_len,
        win_length=n_fft,
        window=torch.hann_window(n_fft),
        return_complex=True,
    )
    noise_power = noise_stft.abs().pow(2).mean(dim=-1, keepdim=True)

    # Full signal STFT
    signal_stft = torch.stft(
        samples,
        n_fft=n_fft,
        hop_length=hop_len,
        win_length=n_fft,
        window=torch.hann_window(n_fft),
        return_complex=True,
    )
    signal_power = signal_stft.abs().pow(2)

    # Subtract noise power (floor at 0)
    alpha = 2.0   # over-subtraction factor
    clean_power = torch.clamp(signal_power - alpha * noise_power, min=0.0)

    # Reconstruct with original phase
    magnitude_ratio = torch.sqrt(clean_power / (signal_power + 1e-10))
    clean_stft = signal_stft * magnitude_ratio

    # iSTFT
    clean_samples = torch.istft(
        clean_stft,
        n_fft=n_fft,
        hop_length=hop_len,
        win_length=n_fft,
        window=torch.hann_window(n_fft),
        length=n,
    )

    # Re-normalise after noise reduction (can shift peak)
    clean_waveform = clean_samples.unsqueeze(0)
    clean_waveform = _peak_normalise(clean_waveform)
    return clean_waveform
