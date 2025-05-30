import Link from "next/link";

import { MinimizableChatWidget } from "@/components/minimizable-chat-widget";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Theme toggle in top right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-4">Q&A Support Assistant</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Chat History</h2>
            <p className="text-muted-foreground mb-4">
              View all your previous conversations and start new chat sessions.
            </p>
            <Link
              href="/chats"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              View Chats
            </Link>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Demo Page</h2>
            <p className="text-muted-foreground mb-4">
              Visit our dedicated widget demo page to see the chat interface
              in a different context.
            </p>
            <Link
              href="/widget"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              View Widget Demo
            </Link>
          </div>
        </div>
      </main>

      <MinimizableChatWidget />
    </div>
  );
}
