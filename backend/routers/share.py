from __future__ import annotations

import json
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from backend.core.security import get_current_user
from backend.models.domain import UserContext
from backend.routers.deps import get_container
from backend.schemas.share import CreateShareLinkResponse, SharedActionItem, SharedMeetingResponse
from backend.services.container import ServiceContainer

router = APIRouter(tags=["sharing"])


def _parse_summary(value: object) -> dict | None:
    if value is None:
        return None
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            return None
    return None


@router.post("/meetings/{meeting_id}/share-link", response_model=CreateShareLinkResponse)
async def create_share_link(
    meeting_id: str,
    container: ServiceContainer = Depends(get_container),
    user: UserContext = Depends(get_current_user),
) -> CreateShareLinkResponse:
    meeting = await container.db.fetch_one(
        "meetings",
        filters={"id": meeting_id},
        access_token=user.access_token or "",
    )
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    token = secrets.token_urlsafe(24)
    await container.db.insert_rows(
        "meeting_shares",
        [
            {
                "meeting_id": meeting_id,
                "created_by": user.id,
                "token": token,
            }
        ],
    )
    return CreateShareLinkResponse(token=token, path=f"/shared/{token}")


@router.get("/share/{token}", response_model=SharedMeetingResponse)
async def get_shared_meeting(
    token: str,
    container: ServiceContainer = Depends(get_container),
) -> SharedMeetingResponse:
    share = await container.db.fetch_one(
        "meeting_shares",
        filters={"token": token, "is_revoked": False},
    )
    if not share:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared link not found")

    expires_at = share.get("expires_at")
    if isinstance(expires_at, str):
        try:
            expires_dt = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
            if expires_dt < datetime.now(timezone.utc):
                raise HTTPException(status_code=status.HTTP_410_GONE, detail="Shared link expired")
        except ValueError:
            pass

    meeting_id = str(share["meeting_id"])
    meeting = await container.db.fetch_one("meetings", filters={"id": meeting_id})
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    sessions = await container.db.fetch_many("sessions", filters={"meeting_id": meeting_id})
    sessions_sorted = sorted(
        sessions,
        key=lambda row: row.get("created_at") or "",
        reverse=True,
    )
    latest = sessions_sorted[0] if sessions_sorted else {}

    action_items_rows = await container.db.fetch_many("action_items", filters={"meeting_id": meeting_id})
    action_items = [
        SharedActionItem(
            id=str(row.get("id")),
            title=str(row.get("title") or ""),
            is_completed=bool(row.get("is_completed")),
        )
        for row in action_items_rows
        if row.get("id")
    ]

    return SharedMeetingResponse(
        meeting_id=meeting_id,
        meeting_title=str(meeting.get("title") or "Untitled Meeting"),
        created_at=str(meeting.get("created_at") or ""),
        transcript=latest.get("transcript"),
        summary=_parse_summary(latest.get("summary")),
        action_items=action_items,
    )
