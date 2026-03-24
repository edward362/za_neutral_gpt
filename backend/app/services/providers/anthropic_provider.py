import logging
from typing import AsyncGenerator

import anthropic

from app.config import settings
from app.models.schemas import ChatMessage
from app.services.providers.base import BaseLLMProvider, SYSTEM_PROMPT

logger = logging.getLogger("neutralgpt.providers.anthropic")


class AnthropicProvider(BaseLLMProvider):
    def __init__(self):
        logger.debug(f"Initializing Anthropic provider with model={settings.ANTHROPIC_MODEL}")
        logger.debug(f"API key present: {bool(settings.ANTHROPIC_API_KEY)}")
        self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.ANTHROPIC_MODEL

    def _prepare_messages(self, messages: list[ChatMessage]) -> list[dict]:
        """Anthropic uses a separate system parameter, not a system message in the list."""
        return [m.model_dump() for m in messages]

    async def stream_response(
        self, messages: list[ChatMessage]
    ) -> AsyncGenerator[str, None]:
        prepared = self._prepare_messages(messages)
        logger.info(f"[Anthropic] Streaming with {len(prepared)} messages, model={self.model}")
        async with self.client.messages.stream(
            model=self.model,
            messages=prepared,
            system=SYSTEM_PROMPT,
            max_tokens=4096,
            temperature=0.7,
        ) as stream:
            async for text in stream.text_stream:
                yield text

    async def get_response(self, messages: list[ChatMessage]) -> str:
        prepared = self._prepare_messages(messages)
        logger.info(f"[Anthropic] Non-streaming with {len(prepared)} messages, model={self.model}")
        response = await self.client.messages.create(
            model=self.model,
            messages=prepared,
            system=SYSTEM_PROMPT,
            max_tokens=4096,
            temperature=0.7,
        )
        return response.content[0].text
