import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container"
import { ScrollButton } from "@/components/ui/scroll-button"
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message"
import { Loader } from "@/components/ui/loader"
import { PromptSuggestion } from "@/components/ui/prompt-suggestion"
import type { ChatMessage } from "@/lib/api"

interface ChatMessagesProps {
  messages: ChatMessage[]
  isStreaming: boolean
  onSuggestionClick: (text: string) => void
}

const SUGGESTIONS = [
  "Tell me why my startup idea is bad",
  "Roast my code — I can take it",
  "What am I doing wrong in my career?",
  "Give me the honest truth about AI hype",
]

export function ChatMessages({
  messages,
  isStreaming,
  onSuggestionClick,
}: ChatMessagesProps) {
  const isEmpty = messages.length === 0

  return (
    <div className="relative flex-1">
      <ChatContainerRoot className="h-full">
        <ChatContainerContent className="mx-auto max-w-3xl px-4 py-6">
          {isEmpty ? (
            <EmptyState onSuggestionClick={onSuggestionClick} />
          ) : (
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <ChatBubble
                  key={i}
                  message={msg}
                  isLast={i === messages.length - 1}
                  isStreaming={isStreaming && i === messages.length - 1}
                />
              ))}
            </div>
          )}
          <ChatContainerScrollAnchor />
        </ChatContainerContent>

        <div className="absolute right-4 bottom-4">
          <ScrollButton className="shadow-sm" />
        </div>
      </ChatContainerRoot>
    </div>
  )
}

function EmptyState({
  onSuggestionClick,
}: {
  onSuggestionClick: (text: string) => void
}) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center">
      <div className="mb-2 text-5xl font-black tracking-tighter text-gradient">
        N
      </div>
      <h2 className="mb-2 text-xl font-semibold text-foreground">
        What do you need to hear?
      </h2>
      <p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
        No flattery. No filler. Just the truth you came here for.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((text) => (
          <PromptSuggestion
            key={text}
            onClick={() => onSuggestionClick(text)}
            className="border-border/50 bg-secondary/50 text-muted-foreground hover:border-brand/30 hover:text-foreground text-xs transition-all"
          >
            {text}
          </PromptSuggestion>
        ))}
      </div>
    </div>
  )
}

function ChatBubble({
  message,
  isLast,
  isStreaming,
}: {
  message: ChatMessage
  isLast: boolean
  isStreaming: boolean
}) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <Message className="justify-end">
        <MessageContent className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand/15 px-4 py-3 text-sm text-foreground">
          {message.content}
        </MessageContent>
      </Message>
    )
  }

  const showLoader = isStreaming && isLast && message.content === ""

  return (
    <Message className="justify-start">
      <MessageAvatar
        src=""
        alt="NeutralGPT"
        fallback="N"
        className="h-7 w-7 border border-brand/20 bg-brand/10 text-[10px] font-bold text-brand"
      />
      <div className="max-w-[85%] space-y-2">
        {showLoader ? (
          <Loader variant="typing" size="sm" />
        ) : (
          <MessageContent
            markdown
            className="rounded-2xl rounded-tl-sm bg-transparent p-0 text-sm"
          >
            {message.content}
          </MessageContent>
        )}
      </div>
    </Message>
  )
}
