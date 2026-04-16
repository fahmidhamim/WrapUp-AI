from pydantic import BaseModel, Field


class SuggestTimesRequest(BaseModel):
    meetings: list[dict] = Field(default_factory=list)
    date: str
    timezone: str = "UTC"
    duration_minutes: int = 30


class SuggestedSlot(BaseModel):
    start: str
    reason: str


class SuggestTimesResponse(BaseModel):
    suggestions: list[SuggestedSlot]
