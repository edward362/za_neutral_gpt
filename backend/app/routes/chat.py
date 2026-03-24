import json
import logging
import traceback

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.models.schemas import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    Conversation,
    ConversationListItem,
)
from app.services.conversation import store
from app.services.llm_factory import LLMFactory

logger = logging.getLogger("neutralgpt.routes.chat")

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Non-streaming chat endpoint."""
    logger.info(f"[chat] provider={request.provider}, conv_id={request.conversation_id}, message={request.message[:80]}...")

    # Get or create conversation
    if request.conversation_id:
        conversation = store.get_conversation(request.conversation_id)
        if not conversation:
            logger.warning(f"[chat] Conversation {request.conversation_id} not found")
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = store.create_conversation(provider=request.provider)
        logger.info(f"[chat] Created new conversation: {conversation.id}")

    # Add user message
    user_msg = ChatMessage(role="user", content=request.message)
    store.add_message(conversation.id, user_msg)
    logger.debug(f"[chat] Added user message. Total messages: {len(conversation.messages)}")

    # Get response from LLM
    try:
        provider = LLMFactory.create(request.provider)
        logger.info(f"[chat] Calling {request.provider} for response...")
        response_text = await provider.get_response(conversation.messages)
        logger.info(f"[chat] Got response ({len(response_text)} chars)")
    except Exception as e:
        logger.error(f"[chat] LLM error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    # Add assistant message
    assistant_msg = ChatMessage(role="assistant", content=response_text)
    store.add_message(conversation.id, assistant_msg)

    return ChatResponse(
        conversation_id=conversation.id,
        content=response_text,
        provider=request.provider,
    )


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Streaming chat endpoint using SSE."""
    logger.info(f"[stream] provider={request.provider}, conv_id={request.conversation_id}, message={request.message[:80]}...")

    # Get or create conversation
    if request.conversation_id:
        conversation = store.get_conversation(request.conversation_id)
        if not conversation:
            logger.warning(f"[stream] Conversation {request.conversation_id} not found")
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = store.create_conversation(provider=request.provider)
        logger.info(f"[stream] Created new conversation: {conversation.id}")

    # Add user message
    user_msg = ChatMessage(role="user", content=request.message)
    store.add_message(conversation.id, user_msg)
    logger.debug(f"[stream] Added user message. Total messages: {len(conversation.messages)}")

    try:
        provider = LLMFactory.create(request.provider)
        logger.info(f"[stream] Provider created: {request.provider}")
    except Exception as e:
        logger.error(f"[stream] Failed to create provider: {e}")
        raise HTTPException(status_code=500, detail=f"Provider error: {str(e)}")

    async def event_generator():
        full_response = ""
        try:
            # Send conversation_id first
            logger.debug(f"[stream] Sending metadata event with conv_id={conversation.id}")
            yield {
                "event": "metadata",
                "data": json.dumps({"conversation_id": conversation.id}),
            }

            logger.info(f"[stream] Starting to stream from {request.provider}...")
            chunk_count = 0
            async for chunk in provider.stream_response(conversation.messages):
                full_response += chunk
                chunk_count += 1
                if chunk_count <= 3:
                    logger.debug(f"[stream] Chunk #{chunk_count}: {repr(chunk[:50])}")
                yield {
                    "event": "delta",
                    "data": json.dumps({"content": chunk}),
                }

            logger.info(f"[stream] Stream complete. {chunk_count} chunks, {len(full_response)} chars total")

            # Save complete assistant message
            assistant_msg = ChatMessage(role="assistant", content=full_response)
            store.add_message(conversation.id, assistant_msg)

            yield {
                "event": "done",
                "data": json.dumps({"content": full_response}),
            }
        except Exception as e:
            logger.error(f"[stream] ERROR during streaming: {e}")
            logger.error(traceback.format_exc())
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}),
            }

    return EventSourceResponse(event_generator())


@router.get("/conversations", response_model=list[ConversationListItem])
async def list_conversations():
    """List all conversations."""
    convs = store.list_conversations()
    logger.debug(f"[conversations] Returning {len(convs)} conversations")
    return convs


@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    """Get a specific conversation with all messages."""
    conversation = store.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    logger.debug(f"[conversation] Returning conv {conversation_id} with {len(conversation.messages)} messages")
    return conversation


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation."""
    if not store.delete_conversation(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    logger.info(f"[conversation] Deleted {conversation_id}")
    return {"status": "deleted"}


@router.get("/providers")
async def list_providers():
    """List available LLM providers."""
    providers = LLMFactory.available_providers()
    logger.debug(f"[providers] Available: {providers}")
    return {"providers": providers}
