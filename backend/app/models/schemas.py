from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: str | None = None
    provider: Literal["openai", "anthropic", "google"] = "openai"
    model: str | None = None  # specific model ID, e.g. "gpt-5.4", "o3", etc.


class ChatResponse(BaseModel):
    conversation_id: str
    role: Literal["assistant"] = "assistant"
    content: str
    provider: str
    model: str


class StreamChunk(BaseModel):
    conversation_id: str
    delta: str
    done: bool = False


class Conversation(BaseModel):
    id: str
    title: str = "New conversation"
    messages: list[ChatMessage] = []
    provider: str = "openai"
    model: str = "gpt-4o"
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ConversationListItem(BaseModel):
    id: str
    title: str
    provider: str
    model: str
    created_at: datetime
    updated_at: datetime
