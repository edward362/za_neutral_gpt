import logging
from typing import AsyncGenerator

from openai import AsyncOpenAI

from app.config import settings
from app.models.schemas import ChatMessage
from app.services.providers.base import BaseLLMProvider

logger = logging.getLogger("neutralgpt.providers.openai")


class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        logger.debug(f"Initializing OpenAI provider with model={settings.OPENAI_MODEL}")
        logger.debug(f"API key present: {bool(settings.OPENAI_API_KEY)}, key prefix: {settings.OPENAI_API_KEY[:8] + '...' if settings.OPENAI_API_KEY else 'NONE'}")
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    async def stream_response(
        self, messages: list[ChatMessage]
    ) -> AsyncGenerator[str, None]:
        prepared = self._prepare_messages(messages)
        logger.info(f"[OpenAI] Streaming with {len(prepared)} messages, model={self.model}")
        logger.debug(f"[OpenAI] Messages: {[{'role': m['role'], 'content': m['content'][:50]} for m in prepared]}")
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=prepared,
            stream=True,
            temperature=0.7,
            max_tokens=4096,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content

    async def get_response(self, messages: list[ChatMessage]) -> str:
        prepared = self._prepare_messages(messages)
        logger.info(f"[OpenAI] Non-streaming with {len(prepared)} messages, model={self.model}")
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=prepared,
            temperature=0.7,
            max_tokens=4096,
        )
        return response.choices[0].message.content or ""
