import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, MessageSquare, Trash2, X } from "lucide-react"
import { fetchConversations, deleteConversation } from "@/lib/api"
import type { ConversationListItem } from "@/lib/api"

interface ChatSidebarProps {
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onClose?: () => void
  refreshTrigger: number
}

export function ChatSidebar({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onClose,
  refreshTrigger,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([])

  useEffect(() => {
    fetchConversations()
      .then(setConversations)
      .catch(() => {})
  }, [refreshTrigger])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteConversation(id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (currentConversationId === id) {
      onNewConversation()
    }
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <span className="text-gradient text-sm font-bold tracking-wider uppercase">
          NeutralGPT
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={onNewConversation}
          >
            <Plus className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground md:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Conversations */}
      <ScrollArea className="flex-1 px-2 py-2">
        {conversations.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            No conversations yet.
            <br />
            Start one. Say something wrong.
          </div>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  currentConversationId === conv.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-40" />
                <span className="flex-1 truncate">{conv.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => handleDelete(e, conv.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
          No sugarcoating. No validation.
        </p>
      </div>
    </div>
  )
}
