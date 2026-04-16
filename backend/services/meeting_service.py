from __future__ import annotations

from datetime import datetime, timedelta

from backend.core.config import Settings
from backend.services.groq_client import GroqClient
from backend.schemas.meeting import SuggestTimesResponse, SuggestedSlot


class MeetingService:
    def __init__(self, settings: Settings, groq_client: GroqClient):
        self.settings = settings
        self.groq_client = groq_client

    async def suggest_times(self, *, meetings: list[dict], date: str, timezone: str, duration_minutes: int) -> SuggestTimesResponse:
        if self.settings.groq_api_key:
            ai_result = await self._suggest_with_ai(meetings=meetings, date=date, timezone=timezone, duration_minutes=duration_minutes)
            if ai_result:
                return ai_result
        return self._suggest_with_heuristics(meetings=meetings, date=date, timezone=timezone, duration_minutes=duration_minutes)

    async def _suggest_with_ai(
        self, *, meetings: list[dict], date: str, timezone: str, duration_minutes: int
    ) -> SuggestTimesResponse | None:
        meeting_summary = []
        for meeting in meetings:
            start = meeting.get("start") or meeting.get("start_time") or meeting.get("scheduled_at")
            duration = meeting.get("duration_minutes") or duration_minutes
            title = meeting.get("title") or "Meeting"
            if start:
                meeting_summary.append(f"- {title}: {start} ({duration}m)")
        content = (
            "Return JSON with key 'suggestions' as array of objects {start, reason}. "
            f"Suggest 3 times on date {date} in timezone {timezone} for a {duration_minutes}-minute meeting. "
            "Avoid conflicts and include short reason.\n\n"
            f"Existing meetings:\n{chr(10).join(meeting_summary) if meeting_summary else 'None'}"
        )
        try:
            raw = await self.groq_client.chat_completion(
                model=self.settings.groq_model_chat,
                messages=[
                    {"role": "system", "content": "You are a scheduling assistant. Output strict JSON only."},
                    {"role": "user", "content": content},
                ],
                temperature=0.1,
                response_as_json=True,
            )
            payload = self.groq_client.parse_json(raw)
            suggestions_raw = payload.get("suggestions", [])
            suggestions = [
                SuggestedSlot(start=item.get("start", ""), reason=item.get("reason", "Suggested by AI scheduling"))
                for item in suggestions_raw
                if item.get("start")
            ]
            if suggestions:
                return SuggestTimesResponse(suggestions=suggestions[:5])
        except Exception:
            return None
        return None

    def _suggest_with_heuristics(self, *, meetings: list[dict], date: str, timezone: str, duration_minutes: int) -> SuggestTimesResponse:
        duration = timedelta(minutes=duration_minutes)
        day = datetime.fromisoformat(date)
        day_start = day.replace(hour=9, minute=0, second=0, microsecond=0)
        day_end = day.replace(hour=18, minute=0, second=0, microsecond=0)

        busy_ranges: list[tuple[datetime, datetime]] = []
        for meeting in meetings:
            start = meeting.get("start") or meeting.get("start_time")
            end = meeting.get("end") or meeting.get("end_time")
            if not start or not end:
                continue
            busy_ranges.append((datetime.fromisoformat(start), datetime.fromisoformat(end)))
        busy_ranges.sort(key=lambda item: item[0])

        suggestions: list[SuggestedSlot] = []
        cursor = day_start
        while cursor + duration <= day_end and len(suggestions) < 5:
            proposed_end = cursor + duration
            conflict = any(cursor < busy_end and proposed_end > busy_start for busy_start, busy_end in busy_ranges)
            if not conflict:
                suggestions.append(
                    SuggestedSlot(
                        start=cursor.isoformat(),
                        reason=f"No conflicts detected in {timezone}; {duration_minutes}-minute slot.",
                    )
                )
                cursor += timedelta(minutes=30)
            else:
                cursor += timedelta(minutes=15)

        if not suggestions:
            suggestions.append(
                SuggestedSlot(
                    start=(day_start + timedelta(days=1)).isoformat(),
                    reason="No open slot on requested date; next-day first slot suggested.",
                )
            )
        return SuggestTimesResponse(suggestions=suggestions)
