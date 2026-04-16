from __future__ import annotations

from typing import Any

import httpx
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from structlog import get_logger

from backend.core.config import Settings, get_settings
from backend.models.domain import UserContext

logger = get_logger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)


async def _fetch_supabase_user(token: str, settings: Settings) -> dict[str, Any]:
    url = f"{settings.supabase_url}/auth/v1/user"
    headers = {"Authorization": f"Bearer {token}", "apikey": settings.supabase_anon_key}
    async with httpx.AsyncClient(timeout=settings.http_timeout_seconds) as client:
        response = await client.get(url, headers=headers)
    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token")
    return response.json()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    settings: Settings = Depends(get_settings),
) -> UserContext:
    if credentials is None or credentials.scheme.lower() != "bearer" or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    user = await _fetch_supabase_user(credentials.credentials, settings)
    return UserContext(id=user["id"], email=user.get("email"), access_token=credentials.credentials)


def get_current_user_from_request(request: Request) -> UserContext:
    user = getattr(request.state, "user", None)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user
