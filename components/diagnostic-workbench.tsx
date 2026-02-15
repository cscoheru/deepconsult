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

type Dimension = {
  id: string
  title: string
  icon: React.ElementType
  status: "completed" | "in-progress" | "pending"
  score: number | null
}

type Message = {
  id: number
  role: "ai" | "user"
  text: string
}

type Tag = {
  label: string
  dimension: string
  timestamp: string
}

const initialDimensions: Dimension[] = [
  { id: "strategy", title: "Strategy", icon: Compass, status: "completed", score: 78 },
  { id: "structure", title: "Structure", icon: Network, status: "completed", score: 62 },
  { id: "performance", title: "Performance", icon: BarChart3, status: "in-progress", score: null },
  { id: "compensation", title: "Compensation", icon: Banknote, status: "pending", score: null },
  { id: "talent", title: "Talent", icon: Users, status: "pending", score: null },
]

const mockConversation: Message[] = [
  {
    id: 1,
    role: "ai",
    text: "Let's explore your organization's performance management practices. How would you describe your current approach to setting and tracking goals across teams?",
  },
  {
    id: 2,
    role: "user",
    text: "We use OKRs at the company level, but adoption is inconsistent across departments. Engineering tracks them rigorously, while sales mostly ignores the framework.",
  },
  {
    id: 3,
    role: "ai",
    text: "That inconsistency is a significant finding. When a core management framework like OKRs isn't uniformly adopted, it often signals a deeper issue with leadership alignment or insufficient change management during rollout. How does leadership review performance\u2014is there a structured cadence?",
  },
  {
    id: 4,
    role: "user",
    text: "Quarterly business reviews at the exec level. Middle managers have monthly 1:1s but there's no standardized format\u2014some do it well, others treat it as a checkbox.",
  },
  {
    id: 5,
    role: "ai",
    text: "I\u2019m detecting a pattern here: strong intent at the top but poor ritualization at the operational layer. This is what we call a \u2018Performance Management Decay Gradient\u2019\u2014the further from the C-suite, the weaker the system becomes. Let me ask about feedback loops next.",
  },
]

const mockTags: Tag[] = [
  { label: "OKR Fragmentation", dimension: "Performance", timestamp: "2:34" },
  { label: "Leadership Misalignment", dimension: "Structure", timestamp: "2:41" },
  { label: "Inconsistent Cadence", dimension: "Performance", timestamp: "3:12" },
  { label: "Middle Mgmt Gap", dimension: "Talent", timestamp: "3:28" },
  { label: "Decay Gradient", dimension: "Performance", timestamp: "3:45" },
  { label: "Change Mgmt Deficit", dimension: "Strategy", timestamp: "3:52" },
]

const confidenceData = 72

export default function DiagnosticWorkbench() {
  const [inputValue, setInputValue] = useState("")
  const [messages] = useState<Message[]>(mockConversation)
  const [dimensions] = useState<Dimension[]>(initialDimensions)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
              const isActive = dim.status === "in-progress"
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
            <span className="font-medium text-foreground">40%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-[40%] rounded-full bg-primary transition-all" />
          </div>
        </div>
      </aside>

      {/* Center - Chat Interface */}
      <main className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Performance Dimension</h3>
              <p className="text-xs text-muted-foreground">Assessing KPIs, OKR maturity, and review cadence</p>
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
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                    msg.role === "user"
                      ? "rounded-br-md bg-primary/10 text-foreground"
                      : "rounded-bl-md border border-border bg-card/50 text-foreground"
                  }`}
                >
                  {msg.role === "ai" && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs text-primary">
                      <Sparkles className="h-3 w-3" />
                      <span className="font-medium">DeepConsult AI</span>
                    </div>
                  )}
                  <p className={`text-sm leading-relaxed ${msg.role === "ai" ? "font-serif" : ""}`}>
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-2 transition-colors focus-within:border-primary/40">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe your organization's practices..."
                className="flex-1 bg-transparent py-1.5 text-sm text-foreground placeholder-muted-foreground/60 outline-none"
              />
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:brightness-110">
                <Send className="h-4 w-4" />
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
          </div>

          {/* Cross-references */}
          <div className="mb-4">
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Cross-Dimension Links
            </h4>
            <div className="flex flex-col gap-2">
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
                  <TrendingUp className="h-3 w-3" />
                  Emerging Correlation
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Performance decay pattern mirrors structural hierarchy depth from Dimension 2.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Confidence Gauge */}
        <div className="border-t border-border p-4">
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Data Confidence
          </h4>
          <div className="flex flex-col items-center">
            {/* Circular gauge */}
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
                  strokeDasharray={`${confidenceData * 2.51} ${251 - confidenceData * 2.51}`}
                />
              </svg>
              <span className="absolute font-serif text-xl font-bold text-foreground">{confidenceData}%</span>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Need more data points on feedback loops to increase confidence.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}


