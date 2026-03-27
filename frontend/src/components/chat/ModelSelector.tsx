import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Check } from "lucide-react"
import type { Provider } from "@/lib/api"

interface ModelOption {
  id: string
  label: string
  provider: Provider
  category: string
}

const ALL_MODELS: ModelOption[] = [
  // OpenAI - GPT-5.4
  { id: "gpt-5.4", label: "GPT-5.4", provider: "openai", category: "GPT-5.4" },
  { id: "gpt-5.4-mini", label: "GPT-5.4 mini", provider: "openai", category: "GPT-5.4" },
  { id: "gpt-5.4-nano", label: "GPT-5.4 nano", provider: "openai", category: "GPT-5.4" },
  // OpenAI - GPT-5
  { id: "gpt-5", label: "GPT-5", provider: "openai", category: "GPT-5" },
  { id: "gpt-5-mini", label: "GPT-5 mini", provider: "openai", category: "GPT-5" },
  { id: "gpt-5-nano", label: "GPT-5 nano", provider: "openai", category: "GPT-5" },
  // OpenAI - GPT-4.1
  { id: "gpt-4.1", label: "GPT-4.1", provider: "openai", category: "GPT-4.1" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini", provider: "openai", category: "GPT-4.1" },
  { id: "gpt-4.1-nano", label: "GPT-4.1 nano", provider: "openai", category: "GPT-4.1" },
  // OpenAI - GPT-4o
  { id: "gpt-4o", label: "GPT-4o", provider: "openai", category: "GPT-4o" },
  { id: "gpt-4o-mini", label: "GPT-4o mini", provider: "openai", category: "GPT-4o" },
  // OpenAI - Reasoning
  { id: "o4-mini", label: "o4-mini", provider: "openai", category: "Reasoning" },
  { id: "o3", label: "o3", provider: "openai", category: "Reasoning" },
  { id: "o3-mini", label: "o3-mini", provider: "openai", category: "Reasoning" },
  // Anthropic
  { id: "claude-opus-4-0", label: "Claude Opus 4", provider: "anthropic", category: "Claude 4" },
  { id: "claude-sonnet-4-0", label: "Claude Sonnet 4", provider: "anthropic", category: "Claude 4" },
  { id: "claude-sonnet-4-5-20250514", label: "Claude Sonnet 4.5", provider: "anthropic", category: "Claude 4.5" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", provider: "anthropic", category: "Claude 4.5" },
  { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", provider: "anthropic", category: "Claude 3.5" },
  { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku", provider: "anthropic", category: "Claude 3.5" },
  // Google
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "google", category: "Gemini 2.5" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "google", category: "Gemini 2.5" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "google", category: "Gemini 2.0" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", provider: "google", category: "Gemini 2.0" },
]

const PROVIDER_COLORS: Record<string, string> = {
  openai: "bg-[hsl(152,69%,69%)]",
  anthropic: "bg-[hsl(25,100%,55%)]",
  google: "bg-[hsl(212,100%,73%)]",
}

const PROVIDER_LABELS: Record<string, string> = {
  openai: "O",
  anthropic: "A",
  google: "G",
}

interface ModelSelectorProps {
  provider: Provider
  model: string
  onChange: (provider: Provider, model: string) => void
  disabled?: boolean
}

export function ModelSelector({ provider, model, onChange, disabled }: ModelSelectorProps) {
  const current = ALL_MODELS.find((m) => m.id === model) || ALL_MODELS[0]

  // Group models by category
  const grouped: { category: string; models: ModelOption[] }[] = []
  let lastCategory = ""
  for (const m of ALL_MODELS) {
    if (m.category !== lastCategory) {
      grouped.push({ category: m.category, models: [] })
      lastCategory = m.category
    }
    grouped[grouped.length - 1].models.push(m)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className="inline-flex items-center gap-2 border-2 border-foreground px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-foreground transition-all hover:bg-muted hover:shadow-[2px_2px_0px_hsl(var(--shadow-color))] disabled:opacity-50"
      >
        <span className={`flex h-5 w-5 items-center justify-center border-2 border-foreground text-[10px] font-black text-foreground ${PROVIDER_COLORS[current.provider]}`}>
          {PROVIDER_LABELS[current.provider]}
        </span>
        <span className="text-xs font-bold">{current.label}</span>
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 max-h-80 overflow-y-auto">
        {grouped.map((group) => (
          <div key={group.category}>
            <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b-2 border-foreground/10">
              {group.category}
            </div>
            {group.models.map((m) => (
              <DropdownMenuItem
                key={m.id}
                onClick={() => onChange(m.provider, m.id)}
                className="gap-3 font-medium"
              >
                <span className={`flex h-4 w-4 items-center justify-center border border-foreground text-[8px] font-black text-foreground ${PROVIDER_COLORS[m.provider]}`}>
                  {PROVIDER_LABELS[m.provider]}
                </span>
                <span className="flex-1 text-xs">{m.label}</span>
                {model === m.id && (
                  <Check className="h-3.5 w-3.5" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
