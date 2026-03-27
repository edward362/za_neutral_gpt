import logging

from app.services.providers.base import BaseLLMProvider
from app.services.providers.openai_provider import OpenAIProvider, OPENAI_MODELS
from app.services.providers.anthropic_provider import AnthropicProvider, ANTHROPIC_MODELS
from app.services.providers.google_provider import GoogleProvider, GOOGLE_MODELS

logger = logging.getLogger("neutralgpt.llm_factory")


class LLMFactory:
    """Factory pattern for creating LLM provider instances."""

    _provider_classes: dict[str, type[BaseLLMProvider]] = {
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "google": GoogleProvider,
    }

    _provider_models: dict[str, dict] = {
        "openai": OPENAI_MODELS,
        "anthropic": ANTHROPIC_MODELS,
        "google": GOOGLE_MODELS,
    }

    @classmethod
    def create(cls, provider: str, model: str | None = None) -> BaseLLMProvider:
        logger.info(f"Creating provider: {provider}, model: {model}")
        provider_class = cls._provider_classes.get(provider)
        if not provider_class:
            logger.error(
                f"Unknown provider: {provider}. "
                f"Available: {list(cls._provider_classes.keys())}"
            )
            raise ValueError(
                f"Unknown provider: {provider}. "
                f"Available: {list(cls._provider_classes.keys())}"
            )
        instance = provider_class(model=model)
        logger.info(f"Provider {provider} created with model={instance.model}")
        return instance

    @classmethod
    def available_providers(cls) -> list[str]:
        return list(cls._provider_classes.keys())

    @classmethod
    def available_models(cls) -> dict:
        """Return all available models grouped by provider."""
        result = {}
        for provider, models in cls._provider_models.items():
            result[provider] = [
                {"id": model_id, **meta}
                for model_id, meta in models.items()
            ]
        return result
