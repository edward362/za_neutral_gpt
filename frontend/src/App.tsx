import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HeroPage } from "@/pages/HeroPage"
import { ChatPage } from "@/pages/ChatPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  )
}
