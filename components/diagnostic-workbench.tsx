"use client"

import { useState, useRef, useEffect } from "react"
import {
  Compass,
  Network,
  BarChart3,
  Banknote,
  Users,
  Send,
  CheckCircle2,
  Circle,
  Loader2,
  Activity,
  Hash,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { useStreamChat, Message } from "@/lib/hooks/use-stream-chat"
import { createDiagnosisSession } from "@/lib/actions"

type Dimension = {
  id: string
  title: string
  icon: React.ElementType
  status: "completed" | "in-progress" | "pending"
  score: number | null
}

type Tag = {
  label: string
  dimension: string
  timestamp: string
}

const initialDimensions: Dimension[] = [
  { id: "strategy", title: "Strategy", icon: Compass, status: "pending", score: null },
  { id: "structure", title: "Structure", icon: Network, status: "pending", score: null },
  { id: "performance", title: "Performance", icon: BarChart3, status: "pending", score: null },
  { id: "compensation", title: "Compensation", icon: Banknote, status: "pending", score: null },
  { id: "talent", title: "Talent", icon: Users, status: "pending", score: null },
]

const mockTags: Tag[] = []

export default function DiagnosticWorkbench() {
  const [sessionId, setSessionId] = useState<string>("")
  const [dimensions, setDimensions] = useState<Dimension[]>(initialDimensions)
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 使用流式对话 Hook
  const {
    messages,
    isStreaming,
    currentAIResponse,
    sendMessage,
    setMessagesList,
  } = useStreamChat({
    sessionId,
    onMessageComplete: async (msg) => {
      console.log('Message completed:', msg)

      // 对话完成后，后台会自动触发 extractInsights
      // 这里可以轮询检查是否已提取到数据
      // 为简化，这里暂时不展示实时更新
    },
    onError: (error) => {
      console.error('Chat error:', error)
      alert(`对话出错: ${error.message}`)
    },
  })

  // 初始化会话
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data, error } = await createDiagnosisSession()
        if (error) throw error
        if (data) {
          setSessionId(data.id)

          // AI 欢迎消息
          const welcomeMsg: Message = {
            id: 'welcome',
            role: 'assistant',
            content: `欢迎来到 DeepConsult 智能诊断系统！\n\n我将引导您完成组织的五维诊断。我们将从 **${dimensions[0].title}** 维度开始评估。\n\n请告诉我：您的组织目前在${dimensions[0].title}方面面临哪些挑战？`,
            timestamp: new Date(),
          }
          setMessagesList([welcomeMsg])
        }
      } catch (error) {
        console.error('Failed to create session:', error)
        alert('创建诊断会话失败，请刷新页面重试')
      }
    }

    if (!sessionId) {
      initSession()
    }
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, currentAIResponse])

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming || !sessionId) return

    const userMessage = inputValue
    setInputValue("")

    try {
      await sendMessage(userMessage)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">正在初始化诊断会话...</span>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Left Sidebar - Navigation */}
      <aside className="flex w-72 flex-shrink-0 flex-col border-r border-border bg-card/30">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-serif text-sm font-semibold text-foreground">Diagnostic Progress</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">5 dimensions to assess</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-1">
            {dimensions.map((dim, i) => {
              const Icon = dim.icon
              const isActive = i === currentStageIndex
              const isDone = dim.status === "completed"

              return (
                <button
                  key={dim.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-all ${
                    isActive
                      ? "border border-primary/20 bg-primary/5 text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-sm font-medium">{dim.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {isDone ? `Score: ${dim.score}/100` : isActive ? "In progress..." : `Step ${i + 1} of 5`}
                    </span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Overall Progress */}
        <div className="border-t border-border p-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Overall Completion</span>
            <span className="font-medium text-foreground">
              {Math.round((currentStageIndex / 5) * 100)}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(currentStageIndex / 5) * 100}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Center - Chat Interface */}
      <main className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {(() => {
                const Icon = dimensions[currentStageIndex]?.icon;
                return Icon ? <Icon className="h-4 w-4" /> : null;
              })()}
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">
                {dimensions[currentStageIndex]?.title} Dimension
              </h3>
              <p className="text-xs text-muted-foreground">
                Assessing {dimensions[currentStageIndex]?.title.toLowerCase()} practices
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
            <Activity className="h-3 w-3 animate-pulse-glow text-primary" />
            <span className="text-xs font-medium text-primary">AI Active</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                    msg.role === "user"
                      ? "rounded-br-md bg-primary/10 text-foreground"
                      : "rounded-bl-md border border-border bg-card/50 text-foreground"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs text-primary">
                      <Sparkles className="h-3 w-3" />
                      <span className="font-medium">DeepConsult AI</span>
                    </div>
                  )}
                  <p className={`text-sm leading-relaxed ${msg.role === "assistant" ? "font-serif" : ""} whitespace-pre-wrap`}>
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Streaming response */}
            {isStreaming && currentAIResponse && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-border bg-card/50 text-foreground px-5 py-3.5">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs text-primary">
                    <Sparkles className="h-3 w-3" />
                    <span className="font-medium">DeepConsult AI</span>
                  </div>
                  <p className="text-sm leading-relaxed font-serif whitespace-pre-wrap">
                    {currentAIResponse}
                    <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5" />
                  </p>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isStreaming && !currentAIResponse && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-border bg-card/50 px-5 py-3.5">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-2 transition-colors focus-within:border-primary/40">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="描述您的组织现状或提出问题..."
                className="flex-1 min-h-[60px] max-h-[200px] bg-transparent py-1.5 text-sm text-foreground placeholder-muted-foreground/60 outline-none resize-none"
                disabled={isStreaming}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isStreaming}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Your responses are encrypted and analyzed in real-time by our AI engine.
            </p>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Live Insights */}
      <aside className="flex w-80 flex-shrink-0 flex-col border-l border-border bg-card/30">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 animate-pulse-glow text-primary" />
            <h2 className="font-serif text-sm font-semibold text-foreground">AI Extraction Stream</h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Real-time pattern detection</p>
        </div>

        {/* Tags */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Detected Patterns
            </h4>
            {mockTags.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                开始对话后，AI 将自动提取关键洞察和标签...
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {mockTags.map((tag, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card/50 px-3 py-2.5 transition-colors hover:border-primary/20"
                  >
                    <Hash className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{tag.label}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{tag.dimension}</span>
                        <span className="text-muted-foreground/40">{"/"}</span>
                        <span>{tag.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cross-references */}
          <div className="mb-4">
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Cross-Dimension Links
            </h4>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-muted-foreground">
              随着对话深入，AI 将自动识别跨维度的关联性...
            </div>
          </div>
        </div>

        {/* Data Confidence Gauge */}
        <div className="border-t border-border p-4">
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Data Confidence
          </h4>
          <div className="flex flex-col items-center">
            <div className="relative mb-2 flex h-24 w-24 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(215 25% 16%)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(160 84% 39%)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(messages.length / 10) * 251} ${251 - (messages.length / 10) * 251}`}
                />
              </svg>
              <span className="absolute font-serif text-xl font-bold text-foreground">
                {Math.min(Math.round((messages.length / 10) * 100), 100)}%
              </span>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {messages.length < 5
                ? "需要更多对话以提升数据置信度"
                : "数据置信度良好，可继续深入"}
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
