"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatWidget } from "@/components/chat-widget"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw, Home } from "lucide-react"
import { generateSessionId } from "@/lib/langflow"

interface ChatPageProps {
  params: {
    id: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string>(params.id)

  // Use the provided session ID from URL params
  useEffect(() => {
    // If the session ID from params is different, update it
    if (params.id !== sessionId) {
      setSessionId(params.id)
    }
  }, [params.id, sessionId])

  const handleBackToChats = () => {
    router.push('/chats')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleNewChat = () => {
    const newSessionId = generateSessionId()
    router.push(`/chat/${newSessionId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToHome}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBackToChats}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chats
              </Button>
              <div className="text-sm text-muted-foreground">
                Session: {sessionId.substring(0, 8)}...
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleNewChat}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="h-[calc(100vh-120px)]">
          <ChatWidget
            key={sessionId} // Force re-render when session changes
            sessionId={sessionId}
            isMinimized={false}
          />
        </div>
      </div>
    </div>
  )
}
