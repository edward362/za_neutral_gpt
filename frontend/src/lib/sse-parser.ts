/**
 * Robust SSE parser that handles \r\n and \n line endings.
 */
export interface SSEEvent {
  event: string
  data: string
}

export function* parseSSE(chunk: string): Generator<SSEEvent> {
  // Normalize line endings
  const normalized = chunk.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const lines = normalized.split("\n")
  let currentEvent = ""
  let currentData = ""

  for (const line of lines) {
    if (line.startsWith("event:")) {
      currentEvent = line.slice(6).trim()
    } else if (line.startsWith("data:")) {
      currentData = line.slice(5).trim()
    } else if (line === "" && currentEvent && currentData) {
      console.log(`[SSE] Parsed event: ${currentEvent}, data length: ${currentData.length}`)
      yield { event: currentEvent, data: currentData }
      currentEvent = ""
      currentData = ""
    }
  }

  // Handle case where stream doesn't end with empty line
  if (currentEvent && currentData) {
    console.log(`[SSE] Parsed trailing event: ${currentEvent}`)
    yield { event: currentEvent, data: currentData }
  }
}
