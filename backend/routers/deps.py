from __future__ import annotations

from fastapi import HTTPException, Request

from backend.services.container import ServiceContainer


def get_container(request: Request) -> ServiceContainer:
    container = getattr(request.app.state, "container", None)
    if container is None:
        raise HTTPException(status_code=500, detail="Service container not initialized")
    return container

