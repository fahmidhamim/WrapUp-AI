from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str = Field(min_length=1)


class LiveChatRequest(BaseModel):
    messages: list[ChatMessage]


class LiveChatResponse(BaseModel):
    answer: str
