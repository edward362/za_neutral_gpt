import express from "express"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const API_URL = process.env.API_URL || "http://localhost:8000"

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, "dist")))

// Proxy API requests to the Python backend
app.all("/api/*", async (req, res) => {
  const url = `${API_URL}${req.url}`

  try {
    const headers: Record<string, string> = {
      "Content-Type": req.headers["content-type"] || "application/json",
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      // Collect request body
      const chunks: Buffer[] = []
      for await (const chunk of req) {
        chunks.push(chunk)
      }
      fetchOptions.body = Buffer.concat(chunks).toString()
    }

    const apiRes = await fetch(url, fetchOptions)

    // Forward status and headers
    res.status(apiRes.status)

    // Check if SSE response
    const contentType = apiRes.headers.get("content-type") || ""
    if (contentType.includes("text/event-stream")) {
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Cache-Control", "no-cache")
      res.setHeader("Connection", "keep-alive")

      const reader = apiRes.body?.getReader()
      if (reader) {
        const decoder = new TextDecoder()
        const pump = async () => {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            res.write(decoder.decode(value, { stream: true }))
          }
          res.end()
        }
        pump().catch(() => res.end())
      } else {
        res.end()
      }
    } else {
      res.setHeader("Content-Type", contentType)
      const body = await apiRes.text()
      res.send(body)
    }
  } catch (err) {
    console.error("Proxy error:", err)
    res.status(502).json({ error: "Backend unavailable" })
  }
})

// SPA fallback - serve index.html for all other routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"))
})

app.listen(PORT, () => {
  console.log(`NeutralGPT frontend serving on http://localhost:${PORT}`)
  console.log(`Proxying API requests to ${API_URL}`)
})
