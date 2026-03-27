import logging
from typing import AsyncGenerator

from openai import AsyncOpenAI

from app.config import settings
from app.models.schemas import ChatMessage
from app.services.providers.base import (
    BaseLLMProvider,
    is_reasoning_model,
    supports_temperature,
)

logger = logging.getLogger("neutralgpt.providers.openai")


# Default models per category
DEFAULT_OPENAI_MODEL = "gpt-4o"

# All supported OpenAI models with display metadata
OPENAI_MODELS = {
    # GPT-5.4 family
    "gpt-5.4": {"label": "GPT-5.4", "category": "GPT-5.4"},
    "gpt-5.4-mini": {"label": "GPT-5.4 mini", "category": "GPT-5.4"},
    "gpt-5.4-nano": {"label": "GPT-5.4 nano", "category": "GPT-5.4"},
    # GPT-5 family
    "gpt-5": {"label": "GPT-5", "category": "GPT-5"},
    "gpt-5-mini": {"label": "GPT-5 mini", "category": "GPT-5"},
    "gpt-5-nano": {"label": "GPT-5 nano", "category": "GPT-5"},
    # GPT-4.1 family
    "gpt-4.1": {"label": "GPT-4.1", "category": "GPT-4.1"},
    "gpt-4.1-mini": {"label": "GPT-4.1 mini", "category": "GPT-4.1"},
    "gpt-4.1-nano": {"label": "GPT-4.1 nano", "category": "GPT-4.1"},
    # GPT-4o family
    "gpt-4o": {"label": "GPT-4o", "category": "GPT-4o"},
    "gpt-4o-mini": {"label": "GPT-4o mini", "category": "GPT-4o"},
    # Reasoning models (o-series)
    "o4-mini": {"label": "o4-mini", "category": "Reasoning"},
    "o3": {"label": "o3", "category": "Reasoning"},
    "o3-mini": {"label": "o3-mini", "category": "Reasoning"},
}


class OpenAIProvider(BaseLLMProvider):
    def __init__(self, model: str | None = None):
        self.model = model or settings.OPENAI_MODEL or DEFAULT_OPENAI_MODEL
        self._is_reasoning = is_reasoning_model(self.model)
        self._supports_temp = supports_temperature(self.model)

        logger.debug(
            f"Initializing OpenAI provider: model={self.model}, "
            f"reasoning={self._is_reasoning}, temp_support={self._supports_temp}"
        )
        logger.debug(
            f"API key present: {bool(settings.OPENAI_API_KEY)}, "
            f"key prefix: {settings.OPENAI_API_KEY[:8] + '...' if settings.OPENAI_API_KEY else 'NONE'}"
        )
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    def _build_params(self, messages: list[ChatMessage], stream: bool = False) -> dict:
        """Build API parameters, adapting for reasoning vs regular models."""
        if self._is_reasoning:
            prepared = self._prepare_messages_for_reasoning(messages)
        else:
            prepared = self._prepare_messages(messages)

        params: dict = {
            "model": self.model,
            "messages": prepared,
        }

        if stream:
            params["stream"] = True

        # Reasoning models use max_completion_tokens, regular use max_tokens
        if self._is_reasoning:
            params["max_completion_tokens"] = 16384
        else:
            params["max_completion_tokens"] = 4096

        # Only set temperature for models that support it
        if self._supports_temp:
            params["temperature"] = 0.7

        return params

    async def stream_response(
        self, messages: list[ChatMessage]
    ) -> AsyncGenerator[str, None]:
        params = self._build_params(messages, stream=True)
        logger.info(
            f"[OpenAI] Streaming: model={self.model}, "
            f"messages={len(params['messages'])}, reasoning={self._is_reasoning}"
        )

        stream = await self.client.chat.completions.create(**params)
        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content

    async def get_response(self, messages: list[ChatMessage]) -> str:
        params = self._build_params(messages, stream=False)
        logger.info(
            f"[OpenAI] Non-streaming: model={self.model}, "
            f"messages={len(params['messages'])}, reasoning={self._is_reasoning}"
        )

        response = await self.client.chat.completions.create(**params)
        return response.choices[0].message.content or ""
