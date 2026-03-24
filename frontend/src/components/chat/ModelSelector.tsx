import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Check } from "lucide-react"
import type { Provider } from "@/lib/api"

const PROVIDERS: { value: Provider; label: string; icon: string }[] = [
  { value: "openai", label: "GPT-4o", icon: "O" },
  { value: "anthropic", label: "Claude", icon: "C" },
  { value: "google", label: "Gemini", icon: "G" },
]

interface ModelSelectorProps {
  value: Provider
  onChange: (provider: Provider) => void
  disabled?: boolean
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const current = PROVIDERS.find((p) => p.value === value) || PROVIDERS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded bg-brand/20 text-[10px] font-bold text-brand">
          {current.icon}
        </span>
        <span className="text-sm font-medium">{current.label}</span>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {PROVIDERS.map((provider) => (
          <DropdownMenuItem
            key={provider.value}
            onClick={() => onChange(provider.value)}
            className="gap-3"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand/20 text-[10px] font-bold text-brand">
              {provider.icon}
            </span>
            <span className="flex-1">{provider.label}</span>
            {value === provider.value && (
              <Check className="h-4 w-4 text-brand" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
