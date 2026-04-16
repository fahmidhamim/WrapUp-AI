from pydantic import BaseModel, Field


class ProcessSessionResponse(BaseModel):
    job_id: str
    session_id: str
    status: str
    progress: int


class SessionStatusResponse(BaseModel):
    session_id: str
    status: str
    progress: int
    message: str
    retries: int = 0
    error: str | None = None


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=5000)


class AskResponse(BaseModel):
    answer: str
    language: str
    sources: list[str]
