"use client"

import { useState } from "react"
import { ChatWidget } from "@/components/chat-widget"

export function MinimizableChatWidget() {
  const [isMinimized, setIsMinimized] = useState(true)

  return (
    <ChatWidget
      isMinimized={isMinimized}
      onToggleMinimize={() => setIsMinimized(!isMinimized)}
    />
  )
}
