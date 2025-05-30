"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, X, MessageCircle, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  sendChatMessage,
  getChatHistory,
  generateSessionId,
  type LangflowMessage
} from "@/lib/langflow"

interface ChatWidgetProps {
  isMinimized?: boolean
  onToggleMinimize?: () => void
  sessionId?: string
}

export function ChatWidget({
  isMinimized = false,
  onToggleMinimize,
  sessionId: providedSessionId
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<LangflowMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(providedSessionId || null)
  const [isInitializing, setIsInitializing] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize chat session and load history
  useEffect(() => {
    const initializeChat = async () => {
      setIsInitializing(true)
      try {
        let currentSessionId = providedSessionId

        // If no session ID is provided, create a new one or use existing from localStorage (for widget mode only)
        if (!currentSessionId) {
          const storedSessionId = localStorage.getItem('chat-session-id')
          if (storedSessionId) {
            currentSessionId = storedSessionId
          } else {
            currentSessionId = generateSessionId()
            localStorage.setItem('chat-session-id', currentSessionId)
          }
        }

        setSessionId(currentSessionId)

        // Load existing chat history
        if (currentSessionId) {
          const historyResult = await getChatHistory(currentSessionId)
          if (historyResult.success && historyResult.messages && historyResult.messages.length > 0) {
            setMessages(historyResult.messages)
          } else {
            // Only add default welcome message if no history exists and it's a new session
            // For widget mode or new sessions, add welcome message
            if (!providedSessionId || historyResult.messages?.length === 0) {
              setMessages([{
                role: 'assistant',
                content: "Hello! I'm your Q&A assistant. How can I help you today?",
                timestamp: new Date()
              }])
            }
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error)
        // Fallback to basic functionality
        const fallbackSessionId = generateSessionId()
        setSessionId(fallbackSessionId)
        setMessages([{
          role: 'assistant',
          content: "Hello! I'm your Q&A assistant. How can I help you today?",
          timestamp: new Date()
        }])
      } finally {
        setIsInitializing(false)
      }
    }

    initializeChat()
  }, [providedSessionId])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !sessionId) return

    const userMessage: LangflowMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Send message to Langflow and save to Supabase
      const result = await sendChatMessage(userMessage.content, sessionId)

      if (result.success && result.message) {
        const assistantMessage: LangflowMessage = {
          role: "assistant",
          content: result.message,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: LangflowMessage = {
          role: "assistant",
          content: result.error || "I'm sorry, something went wrong. Please try again.",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: LangflowMessage = {
        role: "assistant",
        content: "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isMinimized) {
    return (
      <Button
        onClick={onToggleMinimize}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  // Full page mode (when used in chat pages)
  const isFullPage = !onToggleMinimize

  if (isFullPage) {
    return (
      <Card className="w-full h-full shadow-lg border bg-background flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Q&A Assistant
          </CardTitle>
          <ThemeToggle />
        </CardHeader>

        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
            {isInitializing ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading chat...</span>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message, index) => (
                  <div
                    key={`${message.timestamp.getTime()}-${index}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        {message.role === "user" && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading || isInitializing}
                className="flex-1"
                onKeyPress={handleKeyPress}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading || isInitializing || !sessionId}
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Support Assistant
        </CardTitle>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {onToggleMinimize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMinimize}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea ref={scrollAreaRef} className="h-80 px-4">
          {isInitializing ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading chat...</span>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.timestamp.getTime()}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}>
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="p-2 rounded-full bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-lg px-3 py-2 text-sm bg-muted">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || isInitializing}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || isInitializing}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
