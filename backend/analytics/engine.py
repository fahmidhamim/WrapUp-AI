from __future__ import annotations

from collections import Counter, defaultdict
import unicodedata
from typing import Any

from backend.models.domain import TranscriptSegment


POSITIVE_WORDS = {
    "awesome",
    "bien",
    "bom",
    "bueno",
    "excellent",
    "excellente",
    "good",
    "great",
    "gute",
    "gut",
    "happy",
    "improve",
    "improved",
    "love",
    "nice",
    "optimista",
    "positivo",
    "success",
    "super",
    "well",
    "хорошо",
    "успех",
    "جيد",
    "ممتاز",
    "إيجابي",
    "अच्छा",
    "सफल",
    "ভালো",
    "চমৎকার",
    "সফল",
    "好",
    "很好",
    "成功",
}

NEGATIVE_WORDS = {
    "bad",
    "blocker",
    "delay",
    "delayed",
    "failed",
    "issue",
    "negative",
    "problem",
    "risco",
    "risk",
    "schlecht",
    "fail",
    "bloqueio",
    "bloqueado",
    "problema",
    "retraso",
    "riesgo",
    "malo",
    "плохо",
    "проблема",
    "риск",
    "تأخير",
    "سيء",
    "مشكلة",
    "مخاطر",
    "खराब",
    "जोखिम",
    "समस्या",
    "খারাপ",
    "বিলম্ব",
    "সমস্যা",
    "坏",
    "问题",
    "风险",
}

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "da",
    "de",
    "der",
    "des",
    "die",
    "du",
    "el",
    "en",
    "et",
    "for",
    "il",
    "in",
    "is",
    "la",
    "le",
    "les",
    "los",
    "of",
    "on",
    "or",
    "para",
    "por",
    "que",
    "the",
    "to",
    "un",
    "una",
    "und",
    "y",
}

POSITIVE_EMOJI = ("👍", "✅", "🎉", "😊", "😃", "🙂")
NEGATIVE_EMOJI = ("👎", "❌", "⚠", "😞", "😢", "😠")


class AnalyticsEngine:
    def build_analytics(
        self,
        *,
        transcript: str,
        segments: list[TranscriptSegment],
        session_language: str,
    ) -> dict[str, Any]:
        speaking_time: dict[str, float] = defaultdict(float)
        total_duration = 0.0
        for segment in segments:
            duration = max(0.0, segment.end - segment.start)
            speaking_time[segment.speaker] += duration
            total_duration = max(total_duration, segment.end)

        tokenized = self._tokenize_unicode(transcript)
        keyword_tokens = self._keyword_tokens(tokenized, transcript)
        keyword_counts = Counter(keyword_tokens).most_common(25)
        sentiment = self._estimate_sentiment(tokenized, transcript)

        unique_speakers = max(1, len(speaking_time))
        engagement_score = min(
            100,
            int((len(segments) / unique_speakers) * 7 + min(50, len(tokenized) / 20)),
        )
        return {
            "language": session_language,
            "speaking_time_seconds": dict(speaking_time),
            "engagement_score": engagement_score,
            "sentiment": sentiment,
            "word_frequency": [{"word": key, "count": count} for key, count in keyword_counts],
            "keyword_frequency": [{"keyword": key, "count": count} for key, count in keyword_counts],
            "meeting_duration_seconds": total_duration,
        }

    @staticmethod
    def _tokenize_unicode(text: str) -> list[str]:
        normalized = unicodedata.normalize("NFKC", text).casefold()
        tokens: list[str] = []
        current: list[str] = []
        for char in normalized:
            if char.isalnum():
                current.append(char)
            else:
                if current:
                    tokens.append("".join(current))
                    current = []
        if current:
            tokens.append("".join(current))
        return [token for token in tokens if token]

    @staticmethod
    def _keyword_tokens(tokens: list[str], transcript: str) -> list[str]:
        keywords = [
            token
            for token in tokens
            if len(token) > 1 and not token.isdigit() and token not in STOPWORDS
        ]
        if len(keywords) > 3:
            return keywords

        normalized = unicodedata.normalize("NFKC", transcript).casefold()
        compact = "".join(char for char in normalized if char.isalnum())[:8000]
        if len(compact) >= 2:
            keywords.extend(AnalyticsEngine._char_ngrams(compact, 2)[:4000])
        return keywords

    @staticmethod
    def _estimate_sentiment(tokens: list[str], transcript: str) -> str:
        positive = sum(1 for token in tokens if token in POSITIVE_WORDS)
        negative = sum(1 for token in tokens if token in NEGATIVE_WORDS)

        positive += sum(transcript.count(marker) for marker in POSITIVE_EMOJI)
        negative += sum(transcript.count(marker) for marker in NEGATIVE_EMOJI)

        if positive > negative:
            return "positive"
        if negative > positive:
            return "negative"
        return "neutral"

    @staticmethod
    def _char_ngrams(value: str, n: int) -> list[str]:
        if n <= 0 or len(value) < n:
            return []
        return [value[index : index + n] for index in range(len(value) - n + 1)]
