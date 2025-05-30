import { saveMessage, getChatBySessionId, type Message } from './supabase'

const LANGFLOW_BASE_URL = process.env.NEXT_PUBLIC_LANGFLOW_API_URL;
const LANGFLOW_FLOW_ID = process.env.NEXT_PUBLIC_LANGFLOW_FLOW_ID;

const url = `${LANGFLOW_BASE_URL}/api/v1/run/${LANGFLOW_FLOW_ID}`

export interface ChatResponse {
  success: boolean
  message?: string
  error?: string
}

export interface LangflowMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatSession {
  sessionId: string
  messages: LangflowMessage[]
}

export interface LangflowPayload {
  input_value: string
  input_type: string
  output_type: string
  tweaks: Record<string, unknown>
  chat_history?: { role: string; content: string }[]
}

/**
 * Send a message to Langflow and get a response
 */
export async function sendMessageToLangflow(
  message: string,
  sessionId?: string,
  chatHistory?: Message[]
): Promise<string> {
  if (!LANGFLOW_BASE_URL || !LANGFLOW_FLOW_ID) {
    throw new Error('Langflow configuration is missing. Please check your environment variables.')
  }

  try {
    const payload: LangflowPayload = {
      input_value: message,
      input_type: "chat",
      output_type: "chat",
      tweaks: {}
    }

    if (chatHistory && chatHistory.length > 0) {
      payload.chat_history = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return data.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
           data.outputs?.[0]?.outputs?.[0]?.results?.text ||
           data.result ||
           data.message ||
           "I'm sorry, I couldn't process your request right now."
  } catch (error) {
    console.error("Error calling Langflow API:", error)
    throw new Error("I'm experiencing some technical difficulties. Please try again later.")
  }
}

export async function sendChatMessage(
  message: string,
  sessionId: string
): Promise<ChatResponse> {
  try {
    if (!message.trim()) {
      return { success: false, error: "Message cannot be empty" }
    }

    if (!sessionId) {
      return { success: false, error: "Session ID is required" }
    }

    const { data: chatHistory, error: historyError } = await getChatBySessionId(sessionId)

    if (historyError) {
      console.error("Error fetching chat history:", historyError)
    }

    const { error: userSaveError } = await saveMessage(sessionId, 'user', message.trim())

    if (userSaveError) {
      console.error("Error saving user message:", userSaveError)
      return { success: false, error: "Failed to save your message" }
    }

    const assistantResponse = await sendMessageToLangflow(
      message.trim(),
      sessionId,
      chatHistory || []
    )

    const { error: assistantSaveError } = await saveMessage(
      sessionId,
      'assistant',
      assistantResponse
    )

    if (assistantSaveError) {
      console.error("Error saving assistant message:", assistantSaveError)
      return { success: false, error: "Failed to save assistant response" }
    }

    return {
      success: true,
      message: assistantResponse
    }
  } catch (error) {
    console.error("Error in sendChatMessage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    }
  }
}

export async function getChatHistory(sessionId: string): Promise<{
  success: boolean
  messages?: LangflowMessage[]
  error?: string
}> {
  try {
    const { data: messages, error } = await getChatBySessionId(sessionId)

    if (error) {
      console.error("Error fetching chat history:", error)
      return { success: false, error: "Failed to fetch chat history" }
    }

    const formattedMessages: LangflowMessage[] = (messages || []).map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.created_at)
    }))

    return {
      success: true,
      messages: formattedMessages
    }
  } catch (error) {
    console.error("Error in getChatHistory:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    }
  }
}

export function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function initializeChatSession(): Promise<{
  success: boolean
  sessionId?: string
  error?: string
}> {
  try {
    const sessionId = generateSessionId()

    const welcomeMessage = "Hello! I'm your Q&A assistant. How can I help you today?"
    const { error } = await saveMessage(sessionId, 'assistant', welcomeMessage)

    if (error) {
      console.error("Error saving welcome message:", error)
      return { success: false, error: "Failed to initialize chat session" }
    }

    return {
      success: true,
      sessionId
    }
  } catch (error) {
    console.error("Error initializing chat session:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to initialize chat session"
    }
  }
}
