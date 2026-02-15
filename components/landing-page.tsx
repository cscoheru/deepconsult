"use client"

import {
  Compass,
  Network,
  BarChart3,
  Banknote,
  Users,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Globe,
} from "lucide-react"

const modules = [
  {
    title: "Strategy",
    description: "Evaluate strategic alignment, market positioning, and competitive advantage frameworks.",
    icon: Compass,
    span: "col-span-2",
    accent: "from-emerald-500/10 to-transparent",
  },
  {
    title: "Structure",
    description: "Analyze organizational design, reporting layers, and decision-making velocity.",
    icon: Network,
    span: "col-span-1",
    accent: "from-emerald-500/5 to-transparent",
  },
  {
    title: "Performance",
    description: "Benchmark KPIs, OKR maturity, and performance management effectiveness.",
    icon: BarChart3,
    span: "col-span-1",
    accent: "from-emerald-500/5 to-transparent",
  },
  {
    title: "Compensation",
    description: "Assess pay equity, incentive structures, and total rewards competitiveness.",
    icon: Banknote,
    span: "col-span-1",
    accent: "from-emerald-500/5 to-transparent",
  },
  {
    title: "Talent",
    description: "Map talent density, succession pipelines, and capability gaps across the organization.",
    icon: Users,
    span: "col-span-2",
    accent: "from-emerald-500/10 to-transparent",
  },
]

const stats = [
  { value: "500+", label: "Organizations Diagnosed" },
  { value: "15min", label: "Average Assessment Time" },
  { value: "94%", label: "Recommendation Accuracy" },
  { value: "40+", label: "Industries Covered" },
]

export default function LandingPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 pb-24 pt-32">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(hsl(215 25% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(215 25% 50%) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Radial glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>AI-Powered Organizational Intelligence</span>
          </div>

          <h1 className="mb-6 font-serif text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
            <span className="text-balance">
              Decode Your Organization{"'"}s DNA.
            </span>
          </h1>

          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            AI-driven diagnostics for Strategy, Structure, Performance, Compensation, and Talent.
            Surface hidden inefficiencies in minutes, not months.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={() => onNavigate("workbench")}
              className="group relative flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-medium text-primary-foreground transition-all hover:brightness-110 glow-emerald"
            >
              Start 15-min AI Diagnosis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate("dashboard")}
              className="flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              View Sample Report
            </button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-card/30 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-serif text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5-Dimension Bento Grid */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-primary">
            <Zap className="h-4 w-4" />
            Five Dimensions of Analysis
          </div>
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
            A Complete Organizational X-Ray
          </h2>
          <p className="mb-12 max-w-2xl text-muted-foreground">
            Our AI examines your organization across five critical dimensions, surfacing interconnections
            that traditional consulting misses.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {modules.map((mod, i) => (
              <div
                key={mod.title}
                className={`group relative overflow-hidden rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:glow-emerald md:${mod.span}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Gradient accent */}
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${mod.accent}`} />

                <div className="relative z-10">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <mod.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-semibold text-foreground">{mod.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{mod.description}</p>
                </div>

                {/* Hover arrow */}
                <ArrowRight className="absolute bottom-6 right-6 h-4 w-4 text-muted-foreground/0 transition-all group-hover:text-primary" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-16 md:flex-row">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-primary">
              <Shield className="h-4 w-4" />
              Enterprise Grade
            </div>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">
              Trusted by Fortune 500 Leadership Teams
            </h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              Our diagnostic engine is trained on anonymized data from over 500 organizational assessments,
              peer-reviewed frameworks, and proprietary research from leading business schools.
            </p>
            <div className="flex flex-col gap-3">
              {[
                "SOC 2 Type II Certified",
                "End-to-end encryption for all data",
                "GDPR & CCPA compliant",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="glass flex flex-col gap-4 rounded-xl p-8">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <span className="font-serif text-lg font-semibold text-foreground">Global Reach</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="font-serif text-2xl font-bold text-foreground">42</div>
                  <div className="text-xs text-muted-foreground">Countries</div>
                </div>
                <div>
                  <div className="font-serif text-2xl font-bold text-foreground">12</div>
                  <div className="text-xs text-muted-foreground">Languages</div>
                </div>
                <div>
                  <div className="font-serif text-2xl font-bold text-foreground">50K+</div>
                  <div className="text-xs text-muted-foreground">Executives Served</div>
                </div>
                <div>
                  <div className="font-serif text-2xl font-bold text-foreground">99.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime SLA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Ready to See What Your Organization Really Looks Like?
          </h2>
          <p className="mb-8 text-muted-foreground">
            No setup required. Answer AI-guided questions and receive your diagnostic report instantly.
          </p>
          <button
            onClick={() => onNavigate("workbench")}
            className="group flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-medium text-primary-foreground transition-all hover:brightness-110 glow-emerald"
          >
            Begin Your Diagnosis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="font-serif text-sm font-semibold text-foreground">DeepConsult</div>
          <div className="text-xs text-muted-foreground">
            2026 DeepConsult, Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
