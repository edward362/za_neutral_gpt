export type Provider = "openai" | "anthropic" | "google"

export interface ModelInfo {
  id: string
  label: string
  category: string
}

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ConversationListItem {
  id: string
  title: string
  provider: string
  model: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  provider: string
  model: string
  created_at: string
  updated_at: string
}

const API_BASE = "/api"

export async function fetchConversations(): Promise<ConversationListItem[]> {
  const res = await fetch(`${API_BASE}/conversations`)
  if (!res.ok) throw new Error("Failed to fetch conversations")
  return res.json()
}

export async function fetchConversation(id: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/conversations/${id}`)
  if (!res.ok) throw new Error("Failed to fetch conversation")
  return res.json()
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/conversations/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete conversation")
}

export async function fetchProviders(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/providers`)
  if (!res.ok) throw new Error("Failed to fetch providers")
  const data = await res.json()
  return data.providers
}

export async function fetchModels(): Promise<Record<string, ModelInfo[]>> {
  const res = await fetch(`${API_BASE}/models`)
  if (!res.ok) throw new Error("Failed to fetch models")
  return res.json()
}

export interface StreamCallbacks {
  onMetadata: (data: { conversation_id: string; model?: string }) => void
  onDelta: (content: string) => void
  onDone: (fullContent: string) => void
  onError: (error: string) => void
}

export async function streamChat(
  message: string,
  provider: Provider,
  model: string,
  conversationId: string | null,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API_BASE}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      provider,
      model,
      conversation_id: conversationId,
    }),
    signal,
  })

  if (!res.ok) {
    const err = await res.text()
    callbacks.onError(err)
    return
  }

  const reader = res.body?.getReader()
  if (!reader) {
    callbacks.onError("No response body")
    return
  }

  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() || ""

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        const event = line.slice(7).trim()
        // Next line should be data
        const dataLineIndex = lines.indexOf(line) + 1
        if (dataLineIndex < lines.length) {
          const dataLine = lines[dataLineIndex]
          if (dataLine?.startsWith("data: ")) {
            const data = JSON.parse(dataLine.slice(6))
            switch (event) {
              case "metadata":
                callbacks.onMetadata(data)
                break
              case "delta":
                callbacks.onDelta(data.content)
                break
              case "done":
                callbacks.onDone(data.content)
                break
              case "error":
                callbacks.onError(data.error)
                break
            }
          }
        }
      }
    }
  }
}
