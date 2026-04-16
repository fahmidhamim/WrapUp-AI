from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from backend.core.security import get_current_user
from backend.models.domain import UserContext
from backend.routers.deps import get_container
from backend.schemas.meeting import SuggestTimesRequest, SuggestTimesResponse
from backend.services.container import ServiceContainer

router = APIRouter(prefix="/meetings", tags=["meetings"])


@router.post("/suggest-times", response_model=SuggestTimesResponse)
async def suggest_times(
    request: SuggestTimesRequest,
    container: ServiceContainer = Depends(get_container),
    user: UserContext = Depends(get_current_user),
) -> SuggestTimesResponse:
    _ = user
    try:
        return await container.meetings.suggest_times(
            meetings=request.meetings,
            date=request.date,
            timezone=request.timezone,
            duration_minutes=request.duration_minutes,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
