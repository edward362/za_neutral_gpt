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
  model: string
  onModelChange: (provider: Provider, model: string) => void
  initialValue?: string
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  provider,
  model,
  onModelChange,
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
    <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pb-4">
      <PromptInput
        value={value}
        onValueChange={setValue}
        isLoading={isStreaming}
        onSubmit={handleSubmit}
        className="border-3 border-foreground bg-card shadow-[4px_4px_0px_hsl(var(--shadow-color))] rounded-none transition-shadow duration-200"
      >
        <PromptInputTextarea
          placeholder="Ask something. You'll get an honest answer."
          className="text-sm font-medium placeholder:text-muted-foreground/60"
        />
        <PromptInputActions className="justify-between px-2 pb-1 pt-1">
          <ModelSelector
            provider={provider}
            model={model}
            onChange={onModelChange}
            disabled={isStreaming}
          />
          <PromptInputAction
            tooltip={isStreaming ? "Stop generating" : "Send message"}
          >
            <Button
              variant={isStreaming ? "destructive" : value.trim() ? "default" : "ghost"}
              size="icon"
              className="h-9 w-9"
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
      <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
        GOATED GPT will be direct. That's the point.
      </p>
    </div>
  )
}
