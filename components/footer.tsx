import { Sparkles } from "lucide-react"

const footerLinks = {
  核心功能: ["战略诊断", "组织分析", "绩效评估", "薪酬对标", "人才盘点"],
  解决方案: ["企业诊断", "战略解码", "组织变革", "人才发展"],
  产品: ["AI 顾问", "诊断工具", "知识库", "数据分析"],
  关于: ["关于我们", "联系我们", "隐私政策", "服务条款"],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                DeepConsult
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              组织诊断与咨询 AI 中台，基于五维模型的智能分析平台。
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            2026 DeepConsult. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            基于 AI 技术构建 · 五维诊断模型
          </p>
        </div>
      </div>
    </footer>
  )
}
