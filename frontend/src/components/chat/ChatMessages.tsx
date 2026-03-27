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
  MessageActions,
  MessageAction,
} from "@/components/ui/message"
import { Spinner } from "@/components/ui/spinner"
import { PromptSuggestion } from "@/components/ui/prompt-suggestion"
import { Badge } from "@/components/ui/badge"
import { Copy, ThumbsUp, ThumbsDown, Flame } from "lucide-react"
import type { ChatMessage } from "@/lib/api"

interface ChatMessagesProps {
  messages: ChatMessage[]
  isStreaming: boolean
  onSuggestionClick: (text: string) => void
}

const SUGGESTIONS = [
  { text: "Tell me why my startup idea is bad", highlight: "startup idea" },
  { text: "Roast my code, I can take it", highlight: "Roast" },
  { text: "What am I doing wrong in my career?", highlight: "wrong" },
  { text: "Give me the honest truth about AI hype", highlight: "honest truth" },
]

export function ChatMessages({
  messages,
  isStreaming,
  onSuggestionClick,
}: ChatMessagesProps) {
  const isEmpty = messages.length === 0

  return (
    <div className="relative flex-1 overflow-hidden">
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
          <ScrollButton className="border-3 border-foreground shadow-[2px_2px_0px_hsl(var(--shadow-color))]" />
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
      <div className="mb-4 flex h-16 w-16 items-center justify-center border-3 border-foreground bg-primary shadow-[4px_4px_0px_hsl(var(--shadow-color))]">
        <Flame className="h-8 w-8 text-primary-foreground" />
      </div>
      <h2 className="mb-2 font-serif text-3xl font-bold uppercase tracking-tight text-foreground">
        What do you need to hear?
      </h2>
      <p className="mb-10 max-w-md text-center text-sm text-muted-foreground">
        No flattery, no filler. Just the truth you came here for.
      </p>
      <div className="flex flex-wrap justify-center gap-3 max-w-lg">
        {SUGGESTIONS.map(({ text, highlight }) => (
          <PromptSuggestion
            key={text}
            highlight={highlight}
            onClick={() => onSuggestionClick(text)}
            className="border-3 border-foreground bg-card text-foreground shadow-[3px_3px_0px_hsl(var(--shadow-color))] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-200 text-xs font-bold uppercase tracking-wide"
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
        <MessageContent className="max-w-[80%] border-3 border-foreground bg-accent px-4 py-3 text-sm text-accent-foreground shadow-[3px_3px_0px_hsl(var(--shadow-color))]">
          {message.content}
        </MessageContent>
      </Message>
    )
  }

  const showLoader = isStreaming && isLast && message.content === ""
  const showActions = !isStreaming && message.content !== ""

  return (
    <Message className="justify-start">
      <MessageAvatar
        src=""
        alt="GOATED GPT"
        fallback="G"
        className="h-8 w-8 border-2 border-foreground bg-primary text-xs font-black text-primary-foreground shadow-[2px_2px_0px_hsl(var(--shadow-color))]"
      />
      <div className="max-w-[85%] space-y-2">
        {showLoader ? (
          <Spinner variant="dots" size="sm" />
        ) : (
          <>
            <MessageContent
              markdown
              className="border-3 border-foreground bg-card p-4 text-sm shadow-[3px_3px_0px_hsl(var(--shadow-color))]"
            >
              {message.content}
            </MessageContent>
            {showActions && (
              <MessageActions className="mt-1">
                <MessageAction tooltip="Copy">
                  <button
                    className="border-2 border-foreground p-1.5 text-foreground transition-all hover:bg-secondary hover:shadow-[2px_2px_0px_hsl(var(--shadow-color))]"
                    onClick={() => navigator.clipboard.writeText(message.content)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </MessageAction>
                <MessageAction tooltip="Helpful">
                  <button className="border-2 border-foreground p-1.5 text-foreground transition-all hover:bg-success hover:shadow-[2px_2px_0px_hsl(var(--shadow-color))]">
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                </MessageAction>
                <MessageAction tooltip="Not helpful">
                  <button className="border-2 border-foreground p-1.5 text-foreground transition-all hover:bg-destructive hover:text-destructive-foreground hover:shadow-[2px_2px_0px_hsl(var(--shadow-color))]">
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                </MessageAction>
              </MessageActions>
            )}
          </>
        )}
      </div>
    </Message>
  )
}
