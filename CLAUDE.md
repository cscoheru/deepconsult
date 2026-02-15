# DeepConsult - 组织诊断与咨询 AI 中台

## 项目概述

**项目名称**: DeepConsult
**项目类型**: ToB 组织诊断与咨询 AI 中台
**核心概念**: 结合传统管理咨询的"五维模型"(Strategy, Structure, Performance, Compensation, Talent) 与 AI 实时推理能力
**技术栈**: Next.js 16 + TypeScript + Tailwind CSS + Shadcn/ui + Supabase + Zhipu AI / DeepSeek

---

## 技术栈

### 前端
- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5.9
- **样式**: Tailwind CSS 4 + Shadcn/ui
- **动画**: Framer Motion
- **状态管理**: React Hooks + Server Actions

### 后端
- **数据库**: Supabase (PostgreSQL + Vector for RAG)
- **AI 服务**: Zhipu GLM-4 / DeepSeek-V3
- **认证**: Supabase Auth
- **安全**: Row Level Security (RLS)

### 部署
- **平台**: Vercel
- **环境变量**: ZHIPU_AI_KEY, DEEPSEEK_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY

---

## 五维诊断模型

### 1. Strategy (战略维度)
- 战略清晰度、目标一致性、市场定位、竞争优势
- 数据结构: `data_strategy` (JSONB)
- 示例: `{ score: 85, labels: ["战略清晰", "目标明确"], summary: "..." }`

### 2. Structure (组织结构维度)
- 组织架构、汇报关系、决策流程、跨部门协作
- 数据结构: `data_structure` (JSONB)

### 3. Performance (绩效管理维度)
- KPI 设定、绩效评估、反馈机制、激励效果
- 数据结构: `data_performance` (JSONB)

### 4. Compensation (薪酬激励维度)
- 薪酬结构、激励机制、公平性、竞争力
- 数据结构: `data_compensation` (JSONB)

### 5. Talent (人才发展维度)
- 人才梯队、培训发展、文化氛围、员工敬业度
- 数据结构: `data_talent` (JSONB)

---

## 架构设计

### 双 Agent 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    前端对话界面                              │
│  (用户输入 → 实时对话 → AI 顾问助手)                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Agent 1: 前台对话 Agent                          │
│  - 负责与用户对话                                            │
│  - 理解用户意图                                              │
│  - 引导用户提供组织信息                                        │
│  - 调用 AI 推理服务                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Server Actions (API Layer)                     │
│  - 业务逻辑处理                                              │
│  - 数据库操作 (Supabase)                                     │
│  - RAG 检索 (Vector Search)                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Agent 2: 后台提取 Agent                          │
│  - 从对话中提取结构化数据                                      │
│  - 生成五维诊断标签                                          │
│  - 计算各维度得分                                            │
│  - 更新 diagnosis_sessions 表                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase 数据库                            │
│  - profiles (用户档案)                                       │
│  - diagnosis_sessions (诊断会话)                              │
│  - chat_logs (对话记录)                                       │
│  - leads (销售线索)                                          │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

1. **用户输入** → 前端对话界面
2. **前台 Agent** → 处理对话，调用 AI 服务
3. **Server Actions** → 业务逻辑，数据库读写
4. **后台 Agent** → 提取结构化数据，更新五维维度
5. **数据库** → 持久化存储 (RLS 保护)

---

## 目录结构

```
aiwebsite/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 认证相关页面
│   ├── dashboard/           # 仪表板
│   ├── diagnosis/           # 诊断会话
│   ├── api/                 # API Routes (仅 Streaming 场景)
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
├── components/
│   ├── ui/                  # Shadcn/ui 组件
│   ├── business/            # 业务组件
│   └── layout/              # 布局组件
├── lib/
│   ├── supabase/            # Supabase 客户端
│   │   ├── client.ts        # 浏览器客户端
│   │   ├── server.ts        # 服务端客户端
│   │   └── admin.ts         # Admin 客户端
│   ├── ai/                  # AI 服务集成
│   │   ├── zhipu.ts         # 智谱 AI
│   │   └── deepseek.ts      # DeepSeek
│   └── actions/             # Server Actions
│       ├── diagnosis.ts     # 诊断相关
│       ├── profile.ts       # 用户档案
│       └── lead.ts          # 销售线索
├── types/
│   ├── supabase.ts          # Supabase 类型定义
│   └── database.ts          # 生成类型 (npx supabase gen types)
├── supabase/
│   └── migrations/          # SQL 迁移脚本
│       └── 001_initial_schema.sql
├── public/                  # 静态资源
├── styles/                  # 全局样式
├── next.config.mjs          # Next.js 配置
├── tailwind.config.ts       # Tailwind 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目配置
```

---

## 开发指南

### 环境变量

创建 `.env.local` 文件:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI 服务 (二选一或都配置)
ZHIPU_AI_KEY=your-zhipu-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:3001

### 数据库迁移

```bash
# 生成 TypeScript 类型
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

# 在 Supabase SQL Editor 中执行
# supabase/migrations/001_initial_schema.sql
```

---

## 核心功能模块

### Phase 1: 数据基石 (当前)
- ✅ Supabase Schema 设计
- ✅ RLS 安全策略
- ✅ TypeScript 类型定义
- ✅ Supabase 客户端配置

### Phase 2: 五维诊断对话系统
- ⏳ 对话界面组件
- ⏳ 前台对话 Agent
- ⏳ 后台提取 Agent
- ⏳ 实时诊断数据更新

### Phase 3: RAG 知识库
- ⏳ 向量数据库配置
- ⏳ 知识库文档向量化
- ⏳ 语义检索集成

### Phase 4: 可视化与报告
- ⏳ 五维雷达图
- ⏳ 诊断报告生成
- ⏳ Excel/PDF 导出

---

## 安全注意事项

1. **API Key 管理**: 永远不要在前端代码中硬编码 API Key
2. **RLS 策略**: 所有数据库操作都必须通过 RLS 验证
3. **Server Actions**: 敏感操作必须在服务端执行
4. **环境变量**: 生产环境使用 Vercel 环境变量

---

## 联系方式

- **项目目录**: /Users/kjonekong/Documents/aiwebsite
- **Git 仓库**: (待创建)
- **部署地址**: (待配置)
