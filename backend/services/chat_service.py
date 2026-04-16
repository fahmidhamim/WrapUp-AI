from __future__ import annotations

from backend.core.config import Settings
from backend.services.groq_client import GroqClient

SYSTEM_PROMPT = (
    "You are Echo, WrapUp's friendly website assistant. "
    "Answer clearly and concisely. "
    "If asked about WrapUp features, plans, integrations, privacy, or workflow, provide practical guidance. "
    "If information is unknown, say so briefly and suggest the user contact support."
)


class LiveChatService:
    def __init__(self, settings: Settings, groq_client: GroqClient):
        self.settings = settings
        self.groq_client = groq_client

    async def chat(self, messages: list[dict[str, str]]) -> str:
        prompt_messages = [{"role": "system", "content": SYSTEM_PROMPT}, *messages]
        return await self.groq_client.chat_completion(
            model=self.settings.groq_model_chat,
            messages=prompt_messages,
            temperature=self.settings.chat_temperature,
            response_as_json=False,
        )
