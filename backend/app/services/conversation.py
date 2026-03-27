import uuid
from datetime import datetime

from app.models.schemas import ChatMessage, Conversation, ConversationListItem


class ConversationStore:
    """In-memory conversation storage."""

    def __init__(self):
        self._conversations: dict[str, Conversation] = {}

    def create_conversation(
        self, provider: str = "openai", model: str = "gpt-4o"
    ) -> Conversation:
        conv_id = str(uuid.uuid4())
        conversation = Conversation(id=conv_id, provider=provider, model=model)
        self._conversations[conv_id] = conversation
        return conversation

    def get_conversation(self, conversation_id: str) -> Conversation | None:
        return self._conversations.get(conversation_id)

    def add_message(self, conversation_id: str, message: ChatMessage) -> None:
        conv = self._conversations.get(conversation_id)
        if not conv:
            raise ValueError(f"Conversation {conversation_id} not found")
        conv.messages.append(message)
        conv.updated_at = datetime.now()

        # Auto-generate title from first user message
        if conv.title == "New conversation" and message.role == "user":
            conv.title = message.content[:50] + ("..." if len(message.content) > 50 else "")

    def list_conversations(self) -> list[ConversationListItem]:
        return [
            ConversationListItem(
                id=c.id,
                title=c.title,
                provider=c.provider,
                model=c.model,
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
            for c in sorted(
                self._conversations.values(),
                key=lambda x: x.updated_at,
                reverse=True,
            )
        ]

    def delete_conversation(self, conversation_id: str) -> bool:
        if conversation_id in self._conversations:
            del self._conversations[conversation_id]
            return True
        return False


# Singleton instance
store = ConversationStore()
