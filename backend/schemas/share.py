from __future__ import annotations

from pydantic import BaseModel


class CreateShareLinkResponse(BaseModel):
    token: str
    path: str


class SharedActionItem(BaseModel):
    id: str
    title: str
    is_completed: bool


class SharedMeetingResponse(BaseModel):
    meeting_id: str
    meeting_title: str
    created_at: str
    transcript: str | None = None
    summary: dict | None = None
    action_items: list[SharedActionItem]
