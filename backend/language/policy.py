from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
import re

from backend.models.domain import TranscriptSegment


SCRIPT_AR = "ar"
SCRIPT_BN = "bn"
SCRIPT_HI = "hi"
SCRIPT_LATIN = "en"
SCRIPT_UNKNOWN = "und"

# Human-readable names used in LLM prompts — coverage expanded as needed.
_LANGUAGE_NAMES: dict[str, str] = {
    "af": "Afrikaans",
    "ar": "Arabic",
    "az": "Azerbaijani",
    "be": "Belarusian",
    "bg": "Bulgarian",
    "bn": "Bengali",
    "bs": "Bosnian",
    "ca": "Catalan",
    "cs": "Czech",
    "cy": "Welsh",
    "da": "Danish",
    "de": "German",
    "el": "Greek",
    "en": "English",
    "eo": "Esperanto",
    "es": "Spanish",
    "et": "Estonian",
    "eu": "Basque",
    "fa": "Persian",
    "fi": "Finnish",
    "fr": "French",
    "ga": "Irish",
    "gl": "Galician",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "hy": "Armenian",
    "id": "Indonesian",
    "is": "Icelandic",
    "it": "Italian",
    "ja": "Japanese",
    "ka": "Georgian",
    "kk": "Kazakh",
    "km": "Khmer",
    "kn": "Kannada",
    "ko": "Korean",
    "lt": "Lithuanian",
    "lv": "Latvian",
    "mk": "Macedonian",
    "ml": "Malayalam",
    "mn": "Mongolian",
    "mr": "Marathi",
    "ms": "Malay",
    "mt": "Maltese",
    "my": "Burmese",
    "ne": "Nepali",
    "nl": "Dutch",
    "no": "Norwegian",
    "pa": "Punjabi",
    "pl": "Polish",
    "pt": "Portuguese",
    "ro": "Romanian",
    "ru": "Russian",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sq": "Albanian",
    "sr": "Serbian",
    "sv": "Swedish",
    "sw": "Swahili",
    "ta": "Tamil",
    "te": "Telugu",
    "th": "Thai",
    "tl": "Filipino",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "uz": "Uzbek",
    "vi": "Vietnamese",
    "zh": "Chinese",
    "zu": "Zulu",
}

DEFAULT_KEEP_SHORT_CHARS = 12

_TRANSLATION_MARKERS = {
    "translate",
    "translation",
    "অনুবাদ",
    "ترجم",
    "ترجمة",
    "अनुवाद",
}

_LANG_HINTS = {
    "bn": {"আমি", "এবং", "এই", "তুমি", "করে", "হবে", "না", "বাংলা"},
    "hi": {"मैं", "और", "यह", "है", "नहीं", "आप", "हिंदी", "का"},
    "ar": {"أنا", "و", "في", "من", "على", "هذا", "هذه", "العربية"},
    "en": {"the", "and", "this", "that", "with", "for", "not", "meeting"},
}

_BN_NUMERALS = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")
_HI_NUMERALS = str.maketrans("0123456789", "०१२३४५६७८९")
_AR_NUMERALS = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")


@dataclass(slots=True)
class LanguageDecision:
    language: str
    confidence: float
    method: str


@dataclass(slots=True)
class SegmentLanguageStats:
    dominant_language: str
    dominant_share: float
    language_share: dict[str, float]
    segment_languages: list[str]


@dataclass(slots=True)
class LanguageVote:
    language: str
    confidence: float
    method: str
    weight: float


def language_code_to_name(code: str) -> str:
    """Return the human-readable language name for an ISO 639-1 code.

    Falls back to the uppercased code itself so prompts always have something
    meaningful even for uncommon codes (e.g. "XYZ" → "XYZ").
    """
    normalized = normalize_language_code(code)
    return _LANGUAGE_NAMES.get(normalized, normalized.upper() if normalized != SCRIPT_UNKNOWN else "the transcript language")


def normalize_language_code(value: str | None) -> str:
    if not isinstance(value, str):
        return SCRIPT_UNKNOWN
    normalized = value.strip().lower()
    if not normalized:
        return SCRIPT_UNKNOWN
    normalized = normalized.replace("_", "-")
    aliases = {
        "arabic": "ar",
        "bengali": "bn",
        "bangla": "bn",
        "hindi": "hi",
        "english": "en",
    }
    if normalized in aliases:
        return aliases[normalized]
    if "-" in normalized:
        normalized = normalized.split("-", 1)[0]
    return normalized or SCRIPT_UNKNOWN


def detect_text_language(text: str) -> LanguageDecision:
    cleaned = (text or "").strip()
    if not cleaned:
        return LanguageDecision(language=SCRIPT_UNKNOWN, confidence=0.0, method="empty")

    script_lang, script_conf = _detect_from_script(cleaned)
    if script_lang != SCRIPT_UNKNOWN and script_conf >= 0.65:
        return LanguageDecision(language=script_lang, confidence=script_conf, method="script")

    hinted_lang, hinted_conf = _detect_from_hints(cleaned)
    if hinted_lang != SCRIPT_UNKNOWN and hinted_conf >= 0.55:
        return LanguageDecision(language=hinted_lang, confidence=hinted_conf, method="hint")

    detected, score = _detect_with_langdetect(cleaned)
    if detected != SCRIPT_UNKNOWN:
        if script_lang != SCRIPT_UNKNOWN and script_conf >= 0.45 and script_lang != detected:
            return LanguageDecision(language=script_lang, confidence=max(script_conf, score * 0.9), method="script+vote")
        return LanguageDecision(language=detected, confidence=max(score, 0.45), method="langdetect")

    if script_lang != SCRIPT_UNKNOWN:
        return LanguageDecision(language=script_lang, confidence=max(script_conf, 0.45), method="script")

    return LanguageDecision(language=SCRIPT_UNKNOWN, confidence=0.0, method="unknown")


def detect_language_consensus(text: str) -> LanguageDecision:
    """
    Multi-method language detection using only speech content (no filename/metadata).

    Runs three independent detectors and picks the winner by weighted vote:
      - Unicode script analysis  (weight 4.0 for non-Latin, 1.5 for Latin)
      - Language keyword hints   (weight 1.0)
      - langdetect statistical   (weight 2.0)

    Returns a LanguageDecision with method="consensus:<methods>" or the
    single winning method name when only one method fires.
    """
    cleaned = (text or "").strip()
    if not cleaned:
        return LanguageDecision(language=SCRIPT_UNKNOWN, confidence=0.0, method="empty")

    votes: list[LanguageVote] = []

    # Method 1: Unicode script analysis — strongest for non-Latin scripts
    script_lang, script_conf = _detect_from_script(cleaned)
    if script_lang != SCRIPT_UNKNOWN and script_conf >= 0.25:
        weight = 4.0 if script_lang != SCRIPT_LATIN else 1.5
        votes.append(LanguageVote(script_lang, script_conf, "script", weight))

    # Method 2: Language keyword hints
    hint_lang, hint_conf = _detect_from_hints(cleaned)
    if hint_lang != SCRIPT_UNKNOWN and hint_conf >= 0.25:
        votes.append(LanguageVote(hint_lang, hint_conf, "hint", 1.0))

    # Method 3: langdetect statistical model
    ld_lang, ld_conf = _detect_with_langdetect(cleaned)
    if ld_lang != SCRIPT_UNKNOWN:
        votes.append(LanguageVote(ld_lang, ld_conf, "langdetect", 2.0))

    if not votes:
        return LanguageDecision(language=SCRIPT_UNKNOWN, confidence=0.0, method="unknown")

    # Tally weighted scores per language
    tallied: dict[str, float] = {}
    conf_by_lang: dict[str, list[float]] = {}
    for vote in votes:
        tallied[vote.language] = tallied.get(vote.language, 0.0) + vote.weight * vote.confidence
        conf_by_lang.setdefault(vote.language, []).append(vote.confidence)

    total_score = sum(tallied.values())
    winner = max(tallied, key=tallied.__getitem__)
    winner_share = tallied[winner] / total_score if total_score > 0 else 0.0
    avg_conf = sum(conf_by_lang[winner]) / len(conf_by_lang[winner])
    final_conf = min(1.0, max(avg_conf, winner_share))

    methods_used = [v.method for v in votes if v.language == winner]
    method_str = ("consensus:" + "+".join(methods_used)) if len(methods_used) > 1 else methods_used[0]

    return LanguageDecision(language=winner, confidence=final_conf, method=method_str)


def analyze_segment_languages(segments: list[TranscriptSegment]) -> SegmentLanguageStats:
    if not segments:
        return SegmentLanguageStats(
            dominant_language=SCRIPT_UNKNOWN,
            dominant_share=0.0,
            language_share={},
            segment_languages=[],
        )

    weighted_counts: Counter[str] = Counter()
    segment_languages: list[str] = []
    total_weight = 0

    for segment in segments:
        text = (segment.text or "").strip()
        decision = detect_text_language(text)
        lang = normalize_language_code(decision.language)
        segment_languages.append(lang)
        weight = max(1, len(re.sub(r"\s+", "", text)))
        total_weight += weight
        weighted_counts[lang] += weight

    if total_weight == 0:
        return SegmentLanguageStats(
            dominant_language=SCRIPT_UNKNOWN,
            dominant_share=0.0,
            language_share={},
            segment_languages=segment_languages,
        )

    dominant_language, dominant_weight = weighted_counts.most_common(1)[0]
    share = dominant_weight / total_weight
    shares = {lang: value / total_weight for lang, value in weighted_counts.items()}

    return SegmentLanguageStats(
        dominant_language=dominant_language,
        dominant_share=share,
        language_share=shares,
        segment_languages=segment_languages,
    )


def clean_transcript_segments(
    *,
    segments: list[TranscriptSegment],
    target_language: str,
    dominance_threshold: float,
) -> list[TranscriptSegment]:
    if not segments:
        return []

    target = normalize_language_code(target_language)
    stats = analyze_segment_languages(segments)
    should_enforce = stats.dominant_share >= dominance_threshold and stats.dominant_language != SCRIPT_UNKNOWN
    enforced_language = stats.dominant_language if should_enforce else target

    cleaned: list[TranscriptSegment] = []
    for index, segment in enumerate(segments):
        text = (segment.text or "").strip()
        if not text:
            continue

        segment_lang = stats.segment_languages[index] if index < len(stats.segment_languages) else SCRIPT_UNKNOWN
        segment_len = len(re.sub(r"\s+", "", text))

        # If transcript is clearly dominated by one language, drop high-noise segments in other languages.
        if should_enforce and segment_lang not in {enforced_language, SCRIPT_UNKNOWN} and segment_len > DEFAULT_KEEP_SHORT_CHARS:
            continue

        normalized_text = _normalize_text_for_language(text, enforced_language)
        if not normalized_text.strip():
            continue

        cleaned.append(
            TranscriptSegment(
                speaker=segment.speaker,
                text=normalized_text,
                start=segment.start,
                end=segment.end,
            )
        )

    return _merge_adjacent_segments(cleaned)


def is_language_match(text: str, expected_language: str) -> tuple[bool, str, float]:
    expected = normalize_language_code(expected_language)
    if expected == SCRIPT_UNKNOWN:
        return True, SCRIPT_UNKNOWN, 0.0
    # Use multi-method consensus for more reliable output validation.
    decision = detect_language_consensus(text)
    detected = normalize_language_code(decision.language)
    # Treat low-confidence detections as a match to avoid false-positive retries.
    if decision.confidence < 0.45:
        return True, detected, decision.confidence
    return detected == expected, detected, decision.confidence


def is_translation_request(text: str) -> bool:
    normalized = (text or "").strip().lower()
    if not normalized:
        return False
    return any(marker in normalized for marker in _TRANSLATION_MARKERS)


def _detect_from_script(text: str) -> tuple[str, float]:
    counts = Counter()
    letters = 0
    for char in text:
        code = ord(char)
        if _is_bengali(code):
            counts[SCRIPT_BN] += 1
            letters += 1
        elif _is_devanagari(code):
            counts[SCRIPT_HI] += 1
            letters += 1
        elif _is_arabic(code):
            counts[SCRIPT_AR] += 1
            letters += 1
        elif char.isalpha():
            counts[SCRIPT_LATIN] += 1
            letters += 1

    if letters == 0 or not counts:
        return SCRIPT_UNKNOWN, 0.0

    lang, count = counts.most_common(1)[0]
    return lang, count / letters


def _detect_from_hints(text: str) -> tuple[str, float]:
    tokens = [token for token in re.split(r"\W+", text.lower()) if token]
    if not tokens:
        return SCRIPT_UNKNOWN, 0.0

    counts = Counter()
    for token in tokens:
        for lang, hints in _LANG_HINTS.items():
            if token in hints:
                counts[lang] += 1

    if not counts:
        return SCRIPT_UNKNOWN, 0.0

    lang, score = counts.most_common(1)[0]
    return lang, score / max(1, len(tokens) * 0.25)


def _detect_with_langdetect(text: str) -> tuple[str, float]:
    try:
        from langdetect import DetectorFactory
        from langdetect import detect_langs
    except Exception:
        return SCRIPT_UNKNOWN, 0.0

    DetectorFactory.seed = 0
    sample = text[:4000]
    try:
        predictions = detect_langs(sample)
    except Exception:
        return SCRIPT_UNKNOWN, 0.0
    if not predictions:
        return SCRIPT_UNKNOWN, 0.0
    top = predictions[0]
    lang = normalize_language_code(getattr(top, "lang", None))
    prob = float(getattr(top, "prob", 0.0))
    return lang, prob


def _normalize_text_for_language(text: str, language: str) -> str:
    normalized = re.sub(r"\s+", " ", text).strip()
    language = normalize_language_code(language)

    if language == SCRIPT_BN:
        normalized = normalized.translate(_BN_NUMERALS)
        normalized = normalized.replace(" ।", "।")
    elif language == SCRIPT_HI:
        normalized = normalized.translate(_HI_NUMERALS)
    elif language == SCRIPT_AR:
        normalized = normalized.translate(_AR_NUMERALS)
        normalized = normalized.replace(" ؟", "؟").replace(" ،", "،")

    return normalized


def _merge_adjacent_segments(segments: list[TranscriptSegment]) -> list[TranscriptSegment]:
    if not segments:
        return []

    merged: list[TranscriptSegment] = [segments[0]]
    for segment in segments[1:]:
        previous = merged[-1]
        gap = max(0.0, segment.start - previous.end)
        if segment.speaker == previous.speaker and gap <= 1.25:
            merged[-1] = TranscriptSegment(
                speaker=previous.speaker,
                text=f"{previous.text} {segment.text}".strip(),
                start=previous.start,
                end=max(previous.end, segment.end),
            )
            continue
        merged.append(segment)

    return merged


def _is_bengali(code: int) -> bool:
    return 0x0980 <= code <= 0x09FF


def _is_devanagari(code: int) -> bool:
    return 0x0900 <= code <= 0x097F


def _is_arabic(code: int) -> bool:
    return (
        0x0600 <= code <= 0x06FF
        or 0x0750 <= code <= 0x077F
        or 0x08A0 <= code <= 0x08FF
        or 0xFB50 <= code <= 0xFDFF
        or 0xFE70 <= code <= 0xFEFF
    )
