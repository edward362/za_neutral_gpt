import logging

from app.services.providers.base import BaseLLMProvider
from app.services.providers.openai_provider import OpenAIProvider
from app.services.providers.anthropic_provider import AnthropicProvider
from app.services.providers.google_provider import GoogleProvider

logger = logging.getLogger("neutralgpt.llm_factory")


class LLMFactory:
    """Factory pattern for creating LLM provider instances."""

    _providers: dict[str, type[BaseLLMProvider]] = {
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "google": GoogleProvider,
    }

    @classmethod
    def create(cls, provider: str) -> BaseLLMProvider:
        logger.info(f"Creating provider: {provider}")
        provider_class = cls._providers.get(provider)
        if not provider_class:
            logger.error(f"Unknown provider: {provider}. Available: {list(cls._providers.keys())}")
            raise ValueError(
                f"Unknown provider: {provider}. "
                f"Available: {list(cls._providers.keys())}"
            )
        instance = provider_class()
        logger.info(f"Provider {provider} created successfully")
        return instance

    @classmethod
    def available_providers(cls) -> list[str]:
        return list(cls._providers.keys())
