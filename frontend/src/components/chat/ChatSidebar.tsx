import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, MessageSquare, Trash2, X, Flame, Home } from "lucide-react"
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
  const navigate = useNavigate()

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
      <div className="flex shrink-0 items-center justify-between border-b-3 border-foreground p-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 transition-all hover:opacity-80"
        >
          <div className="flex h-7 w-7 items-center justify-center border-2 border-foreground bg-primary shadow-[2px_2px_0px_hsl(var(--shadow-color))]">
            <Flame className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-serif text-sm font-bold uppercase tracking-wide text-sidebar-foreground">
            GOATED GPT
          </span>
        </button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate("/")}
            title="Home"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNewConversation}
            title="New chat"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 px-2 py-2">
        {conversations.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
            No conversations yet.
            <br />
            Start one. Say something wrong.
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group flex w-full items-center gap-2 border-2 px-3 py-2.5 text-left text-sm font-medium transition-all ${
                  currentConversationId === conv.id
                    ? "border-foreground bg-sidebar-accent shadow-[2px_2px_0px_hsl(var(--shadow-color))] text-sidebar-accent-foreground"
                    : "border-transparent text-sidebar-foreground/70 hover:border-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{conv.title}</span>
                <button
                  className="h-6 w-6 shrink-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => handleDelete(e, conv.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 border-t-3 border-foreground p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Honesty over comfort.
        </p>
      </div>
    </div>
  )
}
