import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { AiChatWidget } from "@/components/ai-chat-widget"
import { ExpertiseGrid } from "@/components/expertise-grid"
import { ToolShowcase } from "@/components/tool-showcase"
import { KnowledgeHub } from "@/components/knowledge-hub"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <AiChatWidget />
      <ExpertiseGrid />
      <ToolShowcase />
      <KnowledgeHub />
      <CtaSection />
      <Footer />
    </main>
  )
}
