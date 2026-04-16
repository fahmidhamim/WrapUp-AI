from __future__ import annotations

import argparse
import asyncio

from backend.core.config import get_settings
from backend.services.container import ServiceContainer


async def _run(session_id: str | None) -> None:
    settings = get_settings()
    container = ServiceContainer.build(settings)

    filters = {"transcript": ("not.is", "null")}
    if session_id:
        filters = {"id": session_id}

    sessions = await container.db.fetch_many(
        "sessions",
        filters=filters,
        columns="id,transcript,language_detected",
    )

    rebuilt = 0
    for session in sessions:
        transcript = session.get("transcript")
        if not isinstance(transcript, str) or not transcript.strip():
            continue
        container.rag.index_session_transcript(
            session_id=session["id"],
            transcript=transcript,
            transcript_language=str(session.get("language_detected") or "und"),
        )
        rebuilt += 1

    print(f"Rebuilt FAISS indexes: {rebuilt}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild FAISS transcript indexes.")
    parser.add_argument("--session-id", default=None, help="Optional single session id")
    args = parser.parse_args()
    asyncio.run(_run(args.session_id))


if __name__ == "__main__":
    main()
