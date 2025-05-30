import { MinimizableChatWidget } from "@/components/minimizable-chat-widget"

export default function WidgetPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Enhanced Q&A Support Widget Demo
        </h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-center text-muted-foreground mb-8">
            This is a demo page showing the enhanced chat widget with Supabase persistence.
            The widget is positioned in the bottom-right corner and maintains chat history across sessions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Enhanced Features</h2>
              <ul className="space-y-2">
                <li>• Real-time chat interface</li>
                <li>• Langflow AI integration</li>
                <li>• Persistent chat history with Supabase</li>
                <li>• Session management</li>
                <li>• Dark/Light theme support</li>
                <li>• Responsive design</li>
                <li>• Minimize/maximize functionality</li>
                <li>• Loading states and error handling</li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Configuration Required</h2>
              <ul className="space-y-2">
                <li>• NEXT_PUBLIC_LANGFLOW_API_URL</li>
                <li>• NEXT_PUBLIC_LANGFLOW_FLOW_ID</li>
                <li>• NEXT_PUBLIC_SUPABASE_URL</li>
                <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Make sure your Supabase database has the chat_history table created
                (see supabase.sql in the project root).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Chat Widget with persistence */}
      <MinimizableChatWidget />
    </div>
  )
}
