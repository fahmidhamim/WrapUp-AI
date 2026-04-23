from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException

from backend.core.security import get_current_user
from backend.models.domain import UserContext
from backend.routers.deps import get_container
from backend.schemas.session import AskRequest, AskResponse, ProcessSessionResponse, SessionStatusResponse
from backend.services.container import ServiceContainer
from backend.language import detect_text_language, normalize_language_code

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/{session_id}/process", response_model=ProcessSessionResponse)
async def process_session(
    session_id: str,
    container: ServiceContainer = Depends(get_container),
    user: UserContext = Depends(get_current_user),
) -> ProcessSessionResponse:
    session = await container.db.get_session_for_user(session_id, access_token=user.access_token or "")
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    job = await container.jobs.enqueue(session_id=session_id, user_id=user.id)
    return ProcessSessionResponse(
        job_id=job.job_id,
        session_id=job.session_id,
        status=job.status.value,
        progress=job.progress,
    )


@router.get("/{session_id}/status", response_model=SessionStatusResponse)
async def session_status(
    session_id: str,
    container: ServiceContainer = Depends(get_container),
    user: UserContext = Depends(get_current_user),
) -> SessionStatusResponse:
    session = await container.db.get_session_for_user(session_id, access_token=user.access_token or "")
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    job = container.jobs.get_job(session_id)
    if job:
        return SessionStatusResponse(
            session_id=session_id,
            status=job.status.value,
            progress=job.progress,
            message=job.message,
            retries=job.retries,
            error=job.error,
        )

    analytics_data = session.get("analytics_data")
    if isinstance(analytics_data, str):
        try:
            analytics_data = json.loads(analytics_data)
        except json.JSONDecodeError:
            analytics_data = {}
    if not isinstance(analytics_data, dict):
        analytics_data = {}
    processing = analytics_data.get("processing_status", {})
    status_value = session.get("processing_status") or processing.get("status", "unknown")
    progress_value = session.get("processing_progress")
    if progress_value is None:
        progress_value = processing.get("progress", 0)
    message_value = session.get("processing_message") or processing.get("message", "No active job")
    retries_value = session.get("processing_retries")
    if retries_value is None:
        retries_value = processing.get("retries", 0)
    error_value = session.get("processing_error")
    if error_value is None:
        error_value = processing.get("error")
    return SessionStatusResponse(
        session_id=session_id,
        status=status_value,
        progress=int(progress_value),
        message=message_value,
        retries=int(retries_value),
        error=error_value,
    )


@router.get("/{session_id}/audio-url")
async def get_audio_url(
    session_id: str,
    container: ServiceContainer = Depends(get_container),
    user: UserContext = Depends(get_current_user),
) -> dict:
    session = await container.db.get_session_for_user(session_id, access_token=user.access_token or "")
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    audio_file_url = session.get("audio_file_url") or ""
    if not audio_file_url:
        raise HTTPException(status_code=404, detail="No audio file for this session")
    if audio_file_url.startswith("r2:"):
        if not container.r2.is_available():
            raise HTTPException(status_code=503, detail="R2 storage not configured")
        key = audio_file_url[3:]
        url = container.r2.generate_presigned_download_url(key, expires_in=3600)
    else:
        url = await container.db.resolve_media_url(audio_file_url, expires_in=3600)
    return {"url": url}


@router.post("/{session_id}/ask", response_model=AskResponse)
async def ask_session(
    session_id: str,
    request: AskRequest,
    container: ServiceContainer = Depends(get_container),
    user: UserContext = Depends(get_current_user),
) -> AskResponse:
    session = await container.db.get_session_for_user(session_id, access_token=user.access_token or "")
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    language = _resolve_session_language(session)
    try:
        answer = await container.rag.answer_question(
            session_id=session_id,
            session_language=language,
            question=request.question,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return AskResponse(answer=answer["answer"], language=answer["language"], sources=answer["sources"])


def _resolve_session_language(session: dict) -> str:
    language_value = normalize_language_code(session.get("language_detected"))
    if language_value != "und":
        return language_value

    summary = session.get("summary")
    if isinstance(summary, str):
        try:
            summary = json.loads(summary)
        except json.JSONDecodeError:
            summary = None
    if isinstance(summary, dict):
        summary_language = summary.get("language")
        normalized_summary = normalize_language_code(summary_language if isinstance(summary_language, str) else None)
        if normalized_summary != "und":
            return normalized_summary

    transcript = session.get("transcript")
    if isinstance(transcript, str) and transcript.strip():
        transcript_guess = detect_text_language(transcript)
        guessed_language = normalize_language_code(transcript_guess.language)
        if guessed_language != "und":
            return guessed_language

    return "und"
