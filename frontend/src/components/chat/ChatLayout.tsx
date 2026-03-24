import { useState, useCallback } from "react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { ChatSidebar } from "./ChatSidebar"
import { ChatMessages } from "./ChatMessages"
import { ChatInput } from "./ChatInput"
import { useChat } from "@/hooks/useChat"
import { fetchConversation } from "@/lib/api"
import type { Provider } from "@/lib/api"

export function ChatLayout() {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [provider, setProvider] = useState<Provider>("openai")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [suggestionValue, setSuggestionValue] = useState("")

  const handleConversationCreated = useCallback((id: string) => {
    setConversationId(id)
    setRefreshTrigger((n) => n + 1)
  }, [])

  const { messages, isStreaming, sendMessage, stopStreaming, setMessages } =
    useChat({
      provider,
      conversationId,
      onConversationCreated: handleConversationCreated,
    })

  const handleNewConversation = useCallback(() => {
    setConversationId(null)
    setMessages([])
    setSidebarOpen(false)
  }, [setMessages])

  const handleSelectConversation = useCallback(
    async (id: string) => {
      try {
        const conv = await fetchConversation(id)
        setConversationId(id)
        setMessages(conv.messages)
        setProvider(conv.provider as Provider)
        setSidebarOpen(false)
      } catch {
        // Conversation may have been deleted
      }
    },
    [setMessages]
  )

  const handleSuggestionClick = useCallback(
    (text: string) => {
      setSuggestionValue(text)
      // Send immediately
      sendMessage(text)
      setSuggestionValue("")
    },
    [sendMessage]
  )

  const handleSend = useCallback(
    (message: string) => {
      sendMessage(message)
      setSuggestionValue("")
    },
    [sendMessage]
  )

  return (
    <div className="flex h-screen w-full">
      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 border-r border-sidebar-border md:block">
        <ChatSidebar
          currentConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <ChatSidebar
            currentConversationId={conversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onClose={() => setSidebarOpen(false)}
            refreshTrigger={refreshTrigger}
          />
        </SheetContent>
      </Sheet>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <div className="flex h-12 items-center border-b border-border/50 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 h-8 w-8 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground">
            {conversationId ? "Conversation" : "New chat"}
          </span>
        </div>

        {/* Messages */}
        <ChatMessages
          messages={messages}
          isStreaming={isStreaming}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onStop={stopStreaming}
          isStreaming={isStreaming}
          provider={provider}
          onProviderChange={setProvider}
          initialValue={suggestionValue}
        />
      </div>
    </div>
  )
}
