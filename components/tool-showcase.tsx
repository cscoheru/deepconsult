"use client"

import { useState } from "react"
import {
  ExternalLink,
  BarChart3,
  Layers,
  ArrowRight,
  Activity,
  GitBranch,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const tools = [
  {
    name: "3strategy.com",
    tagline: "Strategic Planning Platform",
    description:
      "An interactive platform for building, stress-testing, and communicating strategic plans. Combines scenario modeling with AI-driven market intelligence.",
    features: [
      { icon: BarChart3, label: "Scenario Modeling" },
      { icon: Layers, label: "Portfolio Analytics" },
      { icon: Activity, label: "Real-time KPIs" },
    ],
    preview: {
      header: "Strategic Plan Dashboard",
      metrics: [
        { label: "Revenue Growth", value: "+18.4%", trend: "up" },
        { label: "Market Share", value: "24.7%", trend: "up" },
        { label: "Execution Score", value: "87/100", trend: "neutral" },
      ],
    },
    href: "https://3strategy.com",
  },
  {
    name: "Org Diagnosis Tool",
    tagline: "Organizational Health Scanner",
    description:
      "AI-powered diagnostic that maps organizational effectiveness across structure, process, people, and culture dimensions. Delivers actionable remediation plans.",
    features: [
      { icon: GitBranch, label: "Structure Mapping" },
      { icon: Zap, label: "Gap Detection" },
      { icon: Activity, label: "Health Scoring" },
    ],
    preview: {
      header: "Organization Health Scan",
      dimensions: [
        { label: "Structure", score: 82 },
        { label: "Process", score: 68 },
        { label: "People", score: 91 },
        { label: "Culture", score: 74 },
      ],
    },
    href: "#",
  },
]

export function ToolShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section id="tools" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm font-medium text-muted-foreground">
            Proprietary Tools
          </div>
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Intelligence Platforms
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Purpose-built tools that extend our advisory with data-driven
            precision and continuous organizational intelligence.
          </p>
        </div>

        {/* Tool toggle */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-xl border border-border bg-secondary/30 p-1">
            {tools.map((tool, i) => (
              <button
                key={tool.name}
                onClick={() => setActiveIndex(i)}
                className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                  activeIndex === i
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tool.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active tool card */}
        {tools.map(
          (tool, i) =>
            activeIndex === i && (
              <div
                key={tool.name}
                className="grid gap-8 lg:grid-cols-2"
              >
                {/* Info */}
                <div className="flex flex-col justify-center">
                  <h3 className="mb-2 text-2xl font-bold text-foreground">
                    {tool.name}
                  </h3>
                  <p className="mb-2 text-sm font-medium text-primary">
                    {tool.tagline}
                  </p>
                  <p className="mb-6 text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>

                  <div className="mb-8 flex flex-wrap gap-4">
                    {tool.features.map((feat) => (
                      <div
                        key={feat.label}
                        className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3"
                      >
                        <feat.icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {feat.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                      asChild
                    >
                      <a href={tool.href} target="_blank" rel="noopener noreferrer">
                        Explore Tool
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Interactive preview */}
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  {/* Fake browser bar */}
                  <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                      <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                      <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                    </div>
                    <div className="ml-3 flex-1 rounded-md bg-secondary px-3 py-1 text-xs text-muted-foreground font-mono">
                      {tool.name === "3strategy.com"
                        ? "app.3strategy.com/dashboard"
                        : "orgdiag.apexadvisory.com"}
                    </div>
                  </div>

                  {/* Preview content */}
                  <div className="p-6">
                    <h4 className="mb-6 text-sm font-semibold text-foreground">
                      {tool.preview.header}
                    </h4>

                    {"metrics" in tool.preview && tool.preview.metrics ? (
                      <div className="grid grid-cols-3 gap-4">
                        {tool.preview.metrics.map((metric) => (
                          <div
                            key={metric.label}
                            className="rounded-xl bg-secondary/50 p-4 text-center"
                          >
                            <p className="mb-1 text-2xl font-bold text-foreground">
                              {metric.value}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {metric.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {"dimensions" in tool.preview && tool.preview.dimensions ? (
                      <div className="flex flex-col gap-4">
                        {tool.preview.dimensions.map((dim) => (
                          <div key={dim.label}>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                              <span className="text-foreground font-medium">
                                {dim.label}
                              </span>
                              <span className="font-mono text-xs text-muted-foreground">
                                {dim.score}/100
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-1000"
                                style={{ width: `${dim.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                      <Activity className="h-3.5 w-3.5 text-primary" />
                      Live data preview
                      <ArrowRight className="ml-auto h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </section>
  )
}
