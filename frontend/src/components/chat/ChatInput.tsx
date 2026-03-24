import { useState } from "react"
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/ui/prompt-input"
import { Button } from "@/components/ui/button"
import { ArrowUp, Square } from "lucide-react"
import { ModelSelector } from "./ModelSelector"
import type { Provider } from "@/lib/api"

interface ChatInputProps {
  onSend: (message: string) => void
  onStop: () => void
  isStreaming: boolean
  provider: Provider
  onProviderChange: (provider: Provider) => void
  initialValue?: string
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  provider,
  onProviderChange,
  initialValue,
}: ChatInputProps) {
  const [value, setValue] = useState(initialValue || "")

  const handleSubmit = () => {
    if (isStreaming) {
      onStop()
      return
    }
    if (!value.trim()) return
    onSend(value.trim())
    setValue("")
  }

  // Sync initial value when it changes (from suggestions)
  if (initialValue && initialValue !== value && !isStreaming) {
    setValue(initialValue)
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <PromptInput
        value={value}
        onValueChange={setValue}
        isLoading={isStreaming}
        onSubmit={handleSubmit}
        className="border-border/60 bg-card/80 backdrop-blur-sm glow-brand"
      >
        <PromptInputTextarea
          placeholder="Say something. I won't sugarcoat the response."
          className="text-sm placeholder:text-muted-foreground/50"
        />
        <PromptInputActions className="justify-between px-2 pb-1 pt-1">
          <ModelSelector
            value={provider}
            onChange={onProviderChange}
            disabled={isStreaming}
          />
          <PromptInputAction
            tooltip={isStreaming ? "Stop generating" : "Send message"}
          >
            <Button
              variant="default"
              size="icon"
              className={`h-8 w-8 rounded-full transition-all ${
                isStreaming
                  ? "bg-destructive hover:bg-destructive/80"
                  : value.trim()
                    ? "bg-brand text-brand-foreground hover:bg-brand/80"
                    : "bg-muted text-muted-foreground"
              }`}
              onClick={handleSubmit}
              disabled={!isStreaming && !value.trim()}
            >
              {isStreaming ? (
                <Square className="h-3.5 w-3.5 fill-current" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
      <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
        NeutralGPT will be direct. That's the point.
      </p>
    </div>
  )
}
