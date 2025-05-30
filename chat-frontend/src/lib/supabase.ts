import { createClient, PostgrestError } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Message = {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  message_order: number
}

export async function getAllChats(): Promise<{ data: Message[] | null; error: PostgrestError | null }> {
  return await supabase
    .from('chat_history')
    .select('*')
    .order('created_at', { ascending: true })
}

export async function getChatBySessionId(
  sessionId: string
): Promise<{ data: Message[] | null; error: PostgrestError | null }> {
  return await supabase
    .from('chat_history')
    .select('*')
    .eq('session_id', sessionId)
    .order('message_order', { ascending: true })
}

export async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<{ data: Message | null; error: PostgrestError | null }> {
  // Get the current highest message_order for this session
  const { data: lastMessage } = await supabase
    .from('chat_history')
    .select('message_order')
    .eq('session_id', sessionId)
    .order('message_order', { ascending: false })
    .limit(1)

  const nextOrder = lastMessage && lastMessage.length > 0 ? lastMessage[0].message_order + 1 : 0

  return await supabase
    .from('chat_history')
    .insert([
      {
        session_id: sessionId,
        role,
        content,
        message_order: nextOrder
      }
    ])
    .select()
    .single()
}

export async function getChatSessions(): Promise<{ data: { session_id: string; latest_message: string; created_at: string; message_count: number }[] | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .rpc('get_chat_sessions')

  if (error) {
    // Fallback if RPC doesn't exist
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('chat_history')
      .select('session_id, content, created_at, role')
      .order('created_at', { ascending: false })

    if (fallbackError) {
      return { data: null, error: fallbackError }
    }

    // Group by session_id and get latest message and count
    const sessionsMap = new Map<string, {
      session_id: string;
      latest_message: string;
      created_at: string;
      message_count: number;
      latest_timestamp: string;
    }>()

    fallbackData?.forEach(msg => {
      if (!sessionsMap.has(msg.session_id)) {
        sessionsMap.set(msg.session_id, {
          session_id: msg.session_id,
          latest_message: msg.content,
          created_at: msg.created_at,
          message_count: 1,
          latest_timestamp: msg.created_at
        })
      } else {
        const existing = sessionsMap.get(msg.session_id)!
        existing.message_count++
        // Update latest message if this message is more recent
        if (msg.created_at > existing.latest_timestamp) {
          existing.latest_message = msg.content
          existing.latest_timestamp = msg.created_at
        }
      }
    })

    // Convert to array and sort by latest activity
    const sessions = Array.from(sessionsMap.values())
      .sort((a, b) => new Date(b.latest_timestamp).getTime() - new Date(a.latest_timestamp).getTime())
      .map(session => ({
        session_id: session.session_id,
        latest_message: session.latest_message,
        created_at: session.created_at,
        message_count: session.message_count
      }))

    return { data: sessions, error: null }
  }

  return { data, error }
}

