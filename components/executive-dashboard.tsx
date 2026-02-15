"use client"

import { useState, useEffect } from "react"
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  ArrowRight,
  Compass,
  Network,
  BarChart3,
  Banknote,
  Users,
  Target,
  CheckCircle2,
} from "lucide-react"

const radarData = [
  { dimension: "Strategy", score: 78, benchmark: 70 },
  { dimension: "Structure", score: 62, benchmark: 75 },
  { dimension: "Performance", score: 55, benchmark: 68 },
  { dimension: "Compensation", score: 71, benchmark: 72 },
  { dimension: "Talent", score: 48, benchmark: 65 },
]

const dimensionDetails = [
  { name: "Strategy", score: 78, icon: Compass, trend: "up" as const, delta: "+5", color: "text-primary" },
  { name: "Structure", score: 62, icon: Network, trend: "down" as const, delta: "-8", color: "text-amber-400" },
  { name: "Performance", score: 55, icon: BarChart3, trend: "down" as const, delta: "-13", color: "text-red-400" },
  { name: "Compensation", score: 71, icon: Banknote, trend: "up" as const, delta: "+1", color: "text-primary" },
  { name: "Talent", score: 48, icon: Users, trend: "down" as const, delta: "-17", color: "text-red-400" },
]

const benchmarkData = [
  { name: "Strategy", yours: 78, industry: 70 },
  { name: "Structure", yours: 62, industry: 75 },
  { name: "Performance", yours: 55, industry: 68 },
  { name: "Comp.", yours: 71, industry: 72 },
  { name: "Talent", yours: 48, industry: 65 },
]

const insights = [
  {
    severity: "critical" as const,
    title: "Strategy-Structure Mismatch Detected",
    description:
      "Your organization's strategy demands agility, but your 6-layer hierarchical structure creates decision latency of 14+ days for operational changes. This mismatch is costing an estimated 23% in execution velocity.",
    dimensions: ["Strategy", "Structure"],
  },
  {
    severity: "warning" as const,
    title: "Talent Pipeline Erosion Risk",
    description:
      "Critical succession gaps identified in 3 of 5 VP-level roles. Combined with below-benchmark engagement scores in high-potential cohort (48th percentile), attrition risk is elevated for the next 6 months.",
    dimensions: ["Talent", "Compensation"],
  },
  {
    severity: "opportunity" as const,
    title: "Performance System Modernization Opportunity",
    description:
      "OKR adoption is inconsistent (only 40% of teams). Standardizing with a modern continuous performance model could unlock an estimated 15-20% productivity improvement based on peer benchmarks.",
    dimensions: ["Performance"],
  },
]

/* ---- Pure SVG Radar Chart ---- */
function RadarChartSVG() {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  const cx = 160
  const cy = 160
  const maxR = 120
  const levels = 5
  const n = radarData.length
  const angleSlice = (2 * Math.PI) / n
  const startAngle = -Math.PI / 2

  function polarToCart(angle: number, radius: number) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  }

  // Grid rings
  const rings = Array.from({ length: levels }, (_, i) => {
    const r = (maxR / levels) * (i + 1)
    const pts = Array.from({ length: n }, (_, j) => {
      const a = startAngle + j * angleSlice
      return polarToCart(a, r)
    })
    return pts.map((p) => `${p.x},${p.y}`).join(" ")
  })

  // Axis lines
  const axes = Array.from({ length: n }, (_, j) => {
    const a = startAngle + j * angleSlice
    const p = polarToCart(a, maxR)
    return p
  })

  // Data polygon
  function getPolygon(key: "score" | "benchmark") {
    return radarData
      .map((d, j) => {
        const a = startAngle + j * angleSlice
        const r = (d[key] / 100) * maxR
        const p = polarToCart(a, animated ? r : 0)
        return `${p.x},${p.y}`
      })
      .join(" ")
  }

  // Labels
  const labels = radarData.map((d, j) => {
    const a = startAngle + j * angleSlice
    const p = polarToCart(a, maxR + 20)
    return { ...p, text: d.dimension }
  })

  return (
    <svg viewBox="0 0 320 320" className="mx-auto h-full w-full max-w-[320px]">
      {/* Grid */}
      {rings.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="hsl(215 25% 16%)"
          strokeWidth="0.75"
        />
      ))}
      {/* Axes */}
      {axes.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="hsl(215 25% 16%)"
          strokeWidth="0.5"
        />
      ))}
      {/* Benchmark polygon */}
      <polygon
        points={getPolygon("benchmark")}
        fill="hsl(215 20% 45%)"
        fillOpacity="0.08"
        stroke="hsl(215 20% 45%)"
        strokeWidth="1"
        strokeDasharray="4 3"
        className="transition-all duration-1000 ease-out"
      />
      {/* Score polygon */}
      <polygon
        points={getPolygon("score")}
        fill="hsl(160 84% 39%)"
        fillOpacity="0.12"
        stroke="hsl(160 84% 39%)"
        strokeWidth="2"
        className="transition-all duration-1000 ease-out"
      />
      {/* Score dots */}
      {radarData.map((d, j) => {
        const a = startAngle + j * angleSlice
        const r = (d.score / 100) * maxR
        const p = polarToCart(a, animated ? r : 0)
        return (
          <circle
            key={j}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="hsl(160 84% 39%)"
            className="transition-all duration-1000 ease-out"
          />
        )
      })}
      {/* Labels */}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="hsl(215 20% 65%)"
          fontSize="11"
          fontFamily="var(--font-inter), system-ui, sans-serif"
        >
          {l.text}
        </text>
      ))}
    </svg>
  )
}

/* ---- Pure SVG Horizontal Bar Chart ---- */
function BenchmarkBarChart() {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(t)
  }, [])

  const barH = 12
  const gap = 40
  const leftPad = 90
  const rightPad = 20
  const chartW = 400
  const barAreaW = chartW - leftPad - rightPad
  const chartH = benchmarkData.length * gap + 20

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="h-full w-full">
      {benchmarkData.map((d, i) => {
        const y = 20 + i * gap
        const yourW = animated ? (d.yours / 100) * barAreaW : 0
        const indW = animated ? (d.industry / 100) * barAreaW : 0
        return (
          <g key={i}>
            {/* Label */}
            <text
              x={leftPad - 10}
              y={y + barH}
              textAnchor="end"
              dominantBaseline="middle"
              fill="hsl(215 20% 65%)"
              fontSize="11"
              fontFamily="var(--font-inter), system-ui, sans-serif"
            >
              {d.name}
            </text>
            {/* Your score bar */}
            <rect
              x={leftPad}
              y={y}
              width={yourW}
              height={barH}
              rx="3"
              fill="hsl(160 84% 39%)"
              className="transition-all duration-700 ease-out"
            />
            {/* Industry bar */}
            <rect
              x={leftPad}
              y={y + barH + 4}
              width={indW}
              height={barH}
              rx="3"
              fill="hsl(215 25% 30%)"
              className="transition-all duration-700 ease-out"
            />
          </g>
        )
      })}
    </svg>
  )
}

export default function ExecutiveDashboard() {
  const overallScore = Math.round(
    radarData.reduce((sum, d) => sum + d.score, 0) / radarData.length
  )

  return (
    <div className="min-h-[calc(100vh-57px)] p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-1 text-xs font-medium uppercase tracking-widest text-primary">
              Executive Summary
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              Organizational Health Report
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Generated February 15, 2026 for Acme Corp
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary">
              <Calendar className="h-4 w-4" />
              Book Expert Consultation
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 glow-emerald">
              <Download className="h-4 w-4" />
              Download Full PDF Report
            </button>
          </div>
        </div>

        {/* Score Overview + Radar Chart */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          {/* Overall Score */}
          <div className="glass flex flex-col items-center justify-center rounded-xl p-8">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Overall Health Score
            </div>
            <div className="relative mb-3 flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="hsl(215 25% 16%)"
                  strokeWidth="5"
                />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="hsl(160 84% 39%)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${overallScore * 2.64} ${264 - overallScore * 2.64}`}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-serif text-4xl font-bold text-foreground">{overallScore}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              Needs Attention
            </div>
          </div>

          {/* Radar Chart */}
          <div className="glass flex flex-col rounded-xl p-6 lg:col-span-2">
            <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
              Five-Dimension Analysis
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">Your scores vs. industry benchmark</p>
            <div className="flex flex-1 items-center justify-center" style={{ minHeight: 280 }}>
              <RadarChartSVG />
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-4 rounded bg-primary" />
                <span>Your Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-4 rounded border-b border-dashed border-muted-foreground" />
                <span>Industry Benchmark</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dimension Score Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {dimensionDetails.map((dim) => {
            const Icon = dim.icon
            return (
              <div key={dim.name} className="glass flex flex-col rounded-xl p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">{dim.name}</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className={`font-serif text-2xl font-bold ${dim.color}`}>{dim.score}</span>
                  <div className={`mb-1 flex items-center gap-0.5 text-xs ${
                    dim.trend === "up" ? "text-primary" : "text-red-400"
                  }`}>
                    {dim.trend === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {dim.delta} vs benchmark
                  </div>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Insights + Benchmark Chart */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Key Insights */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="font-serif text-lg font-semibold text-foreground">Key Findings</h3>
            </div>
            <div className="flex flex-col gap-4">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className="glass rounded-xl p-5"
                  style={{
                    borderColor:
                      insight.severity === "critical"
                        ? "hsla(0, 84%, 60%, 0.2)"
                        : insight.severity === "warning"
                        ? "hsla(40, 84%, 60%, 0.2)"
                        : "hsla(160, 84%, 39%, 0.2)",
                  }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {insight.severity === "critical" ? (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    ) : insight.severity === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                    <h4 className="font-serif text-sm font-semibold text-foreground">{insight.title}</h4>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    {insight.description}
                  </p>
                  <div className="flex items-center gap-2">
                    {insight.dimensions.map((d) => (
                      <span
                        key={d}
                        className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark Comparison */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="font-serif text-lg font-semibold text-foreground">vs. Industry Benchmark</h3>
            </div>
            <div className="glass rounded-xl p-5">
              <div style={{ height: 260 }}>
                <BenchmarkBarChart />
              </div>
              <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
                  <span>Your Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-sm bg-muted" />
                  <span>Industry Avg</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 glass rounded-xl p-5">
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recommended Next Steps
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  "Schedule structure redesign workshop",
                  "Launch talent risk mitigation sprint",
                  "Implement unified OKR framework",
                ].map((action, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                    <span>{action}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
