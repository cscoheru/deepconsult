"use client"

import {
  Target,
  Rocket,
  Network,
  DollarSign,
  Users,
  ArrowUpRight,
} from "lucide-react"

const expertiseAreas = [
  {
    icon: Target,
    title: "Strategy (战略)",
    description:
      "战略清晰度、目标一致性、市场定位、竞争优势分析。结合AI驱动的战略规划框架，帮助企业制定清晰的发展路径。",
    tags: ["战略规划", "市场分析", "竞争定位"],
  },
  {
    icon: Network,
    title: "Structure (组织结构)",
    description:
      "组织架构设计、汇报关系优化、决策流程改进、跨部门协作。通过运营模型重构，提升组织敏捷性和规模效应。",
    tags: ["组织设计", "治理架构", "流程优化"],
  },
  {
    icon: Rocket,
    title: "Performance (绩效管理)",
    description:
      "KPI 体系设计、绩效评估流程、反馈机制建立、激励效果评估。构建卓越运营体系，缩短战略与执行的差距。",
    tags: ["KPI 体系", "绩效评估", "OKR 系统"],
  },
  {
    icon: DollarSign,
    title: "Compensation (薪酬激励)",
    description:
      "薪酬结构优化、激励机制设计、薪酬公平性分析、市场对标。借助市场智能数据，设计精准的激励体系。",
    tags: ["薪酬设计", "激励体系", "市场对标"],
  },
  {
    icon: Users,
    title: "Talent (人才发展)",
    description:
      "人才梯队建设、领导力评估、继任管理、人才生态构建。通过系统化的人才管理，实现持续绩效。",
    tags: ["人才盘点", "继任计划", "学习发展"],
  },
]

export function ExpertiseGrid() {
  return (
    <section id="services" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm font-medium text-muted-foreground">
            核心功能
          </div>
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            五维诊断模型
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            基于传统管理咨询的五维模型，结合 AI 实时推理能力，
            为企业提供全方位的组织诊断与战略咨询服务。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expertiseAreas.map((area, index) => (
            <div
              key={area.title}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
                index >= 3 ? "lg:col-span-1 sm:col-span-1" : ""
              } ${index === 3 ? "lg:col-start-1" : ""} ${index === 4 ? "lg:col-start-2" : ""}`}
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <area.icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100" />
              </div>

              <h3 className="mb-3 text-xl font-semibold text-foreground">
                {area.title}
              </h3>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                {area.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {area.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
