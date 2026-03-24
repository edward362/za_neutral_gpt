import { useState, useCallback, useRef } from "react"
import type { Provider, ChatMessage } from "@/lib/api"
import { parseSSE } from "@/lib/sse-parser"

export interface UseChatOptions {
  provider: Provider
  conversationId: string | null
  onConversationCreated?: (id: string) => void
}

export interface UseChatReturn {
  messages: ChatMessage[]
  isStreaming: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  stopStreaming: () => void
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

export function useChat({
  provider,
  conversationId,
  onConversationCreated,
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const convIdRef = useRef<string | null>(conversationId)

  // Keep ref in sync
  convIdRef.current = conversationId

  const stopStreaming = useCallback(() => {
    console.log("[useChat] Stopping stream")
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return

      console.log(`[useChat] Sending message: "${content.slice(0, 50)}..." | provider=${provider} | convId=${convIdRef.current}`)
      setError(null)
      const userMsg: ChatMessage = { role: "user", content }
      setMessages((prev) => [...prev, userMsg])

      const assistantMsg: ChatMessage = { role: "assistant", content: "" }
      setMessages((prev) => [...prev, assistantMsg])

      setIsStreaming(true)
      const controller = new AbortController()
      abortRef.current = controller

      try {
        console.log("[useChat] Fetching /api/chat/stream...")
        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            provider,
            conversation_id: convIdRef.current,
          }),
          signal: controller.signal,
        })

        console.log(`[useChat] Response status: ${res.status}`)
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`)
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error("No response body")

        const decoder = new TextDecoder()
        let buffer = ""
        let chunkCount = 0

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log("[useChat] Stream reader done")
            break
          }

          const raw = decoder.decode(value, { stream: true })
          chunkCount++
          if (chunkCount <= 5) {
            console.log(`[useChat] Raw chunk #${chunkCount}:`, JSON.stringify(raw))
          }

          // Normalize \r\n to \n before adding to buffer
          buffer += raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

          // Process complete SSE blocks (separated by double newline)
          const blocks = buffer.split("\n\n")
          buffer = blocks.pop() || ""

          if (chunkCount <= 5) {
            console.log(`[useChat] Split into ${blocks.length} blocks, buffer remainder: ${buffer.length} chars`)
          }

          for (const block of blocks) {
            if (!block.trim()) continue

            for (const event of parseSSE(block + "\n")) {
              try {
                const data = JSON.parse(event.data)
                switch (event.event) {
                  case "metadata":
                    console.log(`[useChat] Got metadata: convId=${data.conversation_id}`)
                    if (data.conversation_id && !convIdRef.current) {
                      convIdRef.current = data.conversation_id
                      onConversationCreated?.(data.conversation_id)
                    }
                    break
                  case "delta":
                    setMessages((prev) => {
                      const updated = [...prev]
                      const last = updated[updated.length - 1]
                      if (last?.role === "assistant") {
                        updated[updated.length - 1] = {
                          ...last,
                          content: last.content + data.content,
                        }
                      }
                      return updated
                    })
                    break
                  case "done":
                    console.log(`[useChat] Stream done. Full response: ${data.content.length} chars`)
                    break
                  case "error":
                    console.error(`[useChat] Server error:`, data.error)
                    setError(data.error)
                    break
                }
              } catch (parseErr) {
                console.error("[useChat] Failed to parse event data:", event.data, parseErr)
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const msg = (err as Error).message || "Something went wrong"
          console.error("[useChat] Fetch error:", msg)
          setError(msg)
          // Remove empty assistant message on error
          setMessages((prev) => {
            const last = prev[prev.length - 1]
            if (last?.role === "assistant" && last.content === "") {
              return prev.slice(0, -1)
            }
            return prev
          })
        }
      } finally {
        setIsStreaming(false)
        abortRef.current = null
        console.log("[useChat] Stream finished")
      }
    },
    [provider, isStreaming, onConversationCreated]
  )

  return { messages, isStreaming, error, sendMessage, stopStreaming, setMessages }
}
