"use client"

import { useState, useRef } from "react"
import {
  Send,
  Paperclip,
  ImageIcon,
  Bot,
  User,
  Sparkles,
  FileText,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  attachment?: { name: string; type: "file" | "image" }
}

const suggestedPrompts = [
  "Analyze our org structure for inefficiencies",
  "Help me build a 3-year growth strategy",
  "Evaluate our compensation benchmarks",
  "Diagnose execution bottlenecks",
]

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Welcome to Apex Advisory AI. I can help you with strategic analysis, organizational diagnostics, talent optimization, and more. Share your challenge or upload documents for deeper insight.",
  },
]

export function AiChatWidget() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [attachment, setAttachment] = useState<{
    name: string
    type: "file" | "image"
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!input.trim() && !attachment) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || `Uploaded: ${attachment?.name}`,
      attachment: attachment || undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachment(null)
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Based on the framework you've described, I'd recommend a phased approach to organizational restructuring. The key is to align your operating model with strategic priorities first, then cascade changes through capability building and performance management systems.",
        "I've analyzed the patterns in your description. The compensation structure appears misaligned with market benchmarks for your industry vertical. I'd recommend a total rewards review focusing on pay-for-performance alignment and long-term incentive redesign.",
        "Your strategic challenge requires a multi-dimensional analysis. Let me break this down across three lenses: market positioning, internal capabilities, and execution velocity. Each dimension reveals specific intervention points.",
        "Looking at this from a talent management perspective, the critical gaps appear to be in mid-level leadership bench strength and cross-functional collaboration capability. A targeted development program combined with strategic hiring could address this within 12-18 months.",
      ]

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleFileUpload = (type: "file" | "image") => {
    if (type === "file") {
      fileInputRef.current?.click()
    } else {
      imageInputRef.current?.click()
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "file" | "image"
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachment({ name: file.name, type })
    }
    e.target.value = ""
  }

  return (
    <section id="ai-insights" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <Bot className="h-3.5 w-3.5 text-primary" />
            AI Strategy Advisor
          </div>
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your AI Consulting Partner
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Engage with our AI advisor for instant strategic insights. Upload
            mind maps, org charts, or documents for deep analysis.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-border bg-secondary/30 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Apex AI Advisor
                </h3>
                <p className="text-xs text-muted-foreground">
                  Strategic intelligence engine
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex h-[400px] flex-col gap-4 overflow-y-auto px-6 py-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      msg.role === "assistant"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "assistant"
                        ? "bg-secondary/50 text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {msg.attachment && (
                      <div className="mb-2 flex items-center gap-2 rounded-lg bg-background/20 px-3 py-2 text-xs">
                        {msg.attachment.type === "image" ? (
                          <ImageIcon className="h-3.5 w-3.5" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                        {msg.attachment.name}
                      </div>
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl bg-secondary/50 px-4 py-3">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggested prompts */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 border-t border-border/50 px-6 py-3">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Attachment preview */}
            {attachment && (
              <div className="flex items-center gap-2 border-t border-border/50 px-6 py-2">
                <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs text-foreground">
                  {attachment.type === "image" ? (
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  )}
                  {attachment.name}
                  <button
                    onClick={() => setAttachment(null)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    aria-label="Remove attachment"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-border px-4 py-3">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                onChange={(e) => handleFileChange(e, "file")}
              />
              <input
                ref={imageInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "image")}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleFileUpload("file")}
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleFileUpload("image")}
                aria-label="Attach image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about strategy, org design, talent..."
                className="flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSend}
                disabled={!input.trim() && !attachment}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
