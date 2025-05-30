"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Plus, Home } from "lucide-react"
import { getChatSessions } from "@/lib/supabase"
import { generateSessionId } from "@/lib/langflow"

interface ChatSession {
  session_id: string
  latest_message: string
  created_at: string
  message_count: number
}

export default function ChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChatSessions()
  }, [])

  const loadChatSessions = async () => {
    try {
      const { data, error } = await getChatSessions()
      if (error) {
        console.error("Error loading chat sessions:", error)
      } else {
        setSessions(data || [])
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const createNewChat = () => {
    const newSessionId = generateSessionId()
    window.location.href = `/chat/${newSessionId}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateMessage = (message: string, maxLength: number = 120) => {
    if (message.length <= maxLength) return message
    // Try to break at a word boundary
    const truncated = message.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...'
    }
    return truncated + '...'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading chats...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Chat History</h1>
          </div>
          <Button onClick={createNewChat} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No chats yet</h3>
              <p className="text-muted-foreground mb-4">Start your first conversation</p>
              <Button onClick={createNewChat} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Start New Chat
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Link key={session.session_id} href={`/chat/${session.session_id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">
                          Chat Session
                        </CardTitle>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(session.created_at)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {truncateMessage(session.latest_message)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {session.message_count} messages
                      </span>
                      <span className="font-mono">
                        ID: {session.session_id.substring(0, 8)}...
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
