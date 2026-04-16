from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from backend.routers.deps import get_container
from backend.schemas.chat import LiveChatRequest, LiveChatResponse
from backend.services.container import ServiceContainer

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/live", response_model=LiveChatResponse)
async def live_chat(
    request: LiveChatRequest,
    container: ServiceContainer = Depends(get_container),
) -> LiveChatResponse:
    messages = [{"role": message.role, "content": message.content} for message in request.messages]
    try:
        answer = await container.live_chat.chat(messages)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return LiveChatResponse(answer=answer)
