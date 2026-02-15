"use client"

import { useState } from "react"
import { Hexagon, LayoutDashboard, MessageSquare, Home, ArrowLeft } from "lucide-react"
import LandingPage from "@/components/landing-page"
import DiagnosticWorkbench from "@/components/diagnostic-workbench"
import ExecutiveDashboard from "@/components/executive-dashboard"

type View = "landing" | "workbench" | "dashboard"

const navItems: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "landing", label: "Home", icon: Home },
  { id: "workbench", label: "Workbench", icon: MessageSquare },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
]

export default function Page() {
  const [currentView, setCurrentView] = useState<View>("landing")

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <button
            onClick={() => setCurrentView("landing")}
            className="flex items-center gap-2 py-3.5"
          >
            <Hexagon className="h-5 w-5 text-primary" />
            <span className="font-serif text-base font-bold text-foreground">DeepConsult</span>
          </button>

          {/* Nav Tabs */}
          <nav className="flex items-center">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {currentView !== "landing" && (
            <button
              onClick={() => setCurrentView("landing")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Home
            </button>
          )}
          <div className="h-8 w-8 rounded-full border border-border bg-card" />
        </div>
      </header>

      {/* View Content */}
      <main className="flex-1">
        {currentView === "landing" && <LandingPage onNavigate={(v) => setCurrentView(v as View)} />}
        {currentView === "workbench" && <DiagnosticWorkbench />}
        {currentView === "dashboard" && <ExecutiveDashboard />}
      </main>
    </div>
  )
}
