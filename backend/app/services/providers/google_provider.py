import logging
from typing import AsyncGenerator

from google import genai
from google.genai import types

from app.config import settings
from app.models.schemas import ChatMessage
from app.services.providers.base import BaseLLMProvider, SYSTEM_PROMPT

logger = logging.getLogger("neutralgpt.providers.google")


GOOGLE_MODELS = {
    "gemini-2.5-pro": {"label": "Gemini 2.5 Pro", "category": "Gemini 2.5"},
    "gemini-2.5-flash": {"label": "Gemini 2.5 Flash", "category": "Gemini 2.5"},
    "gemini-2.0-flash": {"label": "Gemini 2.0 Flash", "category": "Gemini 2.0"},
    "gemini-2.0-flash-lite": {"label": "Gemini 2.0 Flash Lite", "category": "Gemini 2.0"},
}


class GoogleProvider(BaseLLMProvider):
    def __init__(self, model: str | None = None):
        self.model = model or settings.GOOGLE_MODEL
        logger.debug(f"Initializing Google provider with model={self.model}")
        logger.debug(f"API key present: {bool(settings.GOOGLE_API_KEY)}")
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)

    def _prepare_contents(self, messages: list[ChatMessage]) -> list[types.Content]:
        """Google Genai uses Content objects with 'user' and 'model' roles."""
        contents = []
        for msg in messages:
            role = "model" if msg.role == "assistant" else "user"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg.content)],
                )
            )
        return contents

    async def stream_response(
        self, messages: list[ChatMessage]
    ) -> AsyncGenerator[str, None]:
        contents = self._prepare_contents(messages)
        logger.info(f"[Google] Streaming with {len(contents)} messages, model={self.model}")
        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.7,
            max_output_tokens=4096,
        )
        async for chunk in self.client.aio.models.generate_content_stream(
            model=self.model,
            contents=contents,
            config=config,
        ):
            if chunk.text:
                yield chunk.text

    async def get_response(self, messages: list[ChatMessage]) -> str:
        contents = self._prepare_contents(messages)
        logger.info(f"[Google] Non-streaming with {len(contents)} messages, model={self.model}")
        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.7,
            max_output_tokens=4096,
        )
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=contents,
            config=config,
        )
        return response.text or ""
