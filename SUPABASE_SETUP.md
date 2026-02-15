# Supabase 配置指南

## 方案选择

### 方案 A：使用 Supabase 云服务（推荐 ⭐）
**优点**：无需安装，快速启动，自动备份
**适用**：生产环境和快速开发

### 方案 B：本地 Supabase（Docker）
**优点**：完全离线开发，数据在本地
**适用**：需要离线开发或测试场景

---

## 方案 A：Supabase 云服务配置步骤

### 第 1 步：创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 账号登录
4. 点击 "New Project"
5. 填写项目信息：
   - **Name**: `deepconsult`
   - **Database Password**: （设置一个强密码，请保存好）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
6. 点击 "Create new project"
7. 等待 2-3 分钟项目创建完成

### 第 2 步：获取 API 密钥

项目创建后，在左侧菜单：
1. 进入 **Settings** → **API**
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: （保密！仅用于服务端）

### 第 3 步：执行数据库迁移

1. 在 Supabase Dashboard，点击左侧 **SQL Editor**
2. 点击 "New query"
3. 复制以下文件内容并粘贴：
   ```
   /Users/kjonekong/Documents/aiwebsite/supabase/migrations/001_initial_schema.sql
   ```
4. 点击 **Run** 执行 SQL
5. 确认看到 "Success" 消息

### 第 4 步：生成 TypeScript 类型

在终端执行：

```bash
# 替换 YOUR_PROJECT_ID 为你的项目 ID（从 Project URL 中获取）
# 例如：https://abcd1234.supabase.co  →  PROJECT_ID 是 abcd1234

npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

或者使用本地链接（需要在 Supabase Dashboard 生成链接）：

```bash
# 在 SQL Editor 中点击右上角 "Generate client types" 获取链接
npx supabase gen types typescript --local > types/database.ts
```

### 第 5 步：配置环境变量

```bash
# 复制环境变量模板
cp .env.local.example .env.local

# 编辑 .env.local 文件
nano .env.local  # 或使用你喜欢的编辑器
```

填入以下内容：

```env
# Supabase（从第 2 步获取）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AI 服务（暂时留空，稍后配置）
ZHIPU_AI_KEY=
DEEPSEEK_API_KEY=

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 第 6 步：验证配置

重启开发服务器：

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

访问 http://localhost:3001，打开浏览器控制台，检查是否有连接错误。

---

## 方案 B：本地 Supabase（可选）

### 安装 Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# 验证安装
supabase --version
```

### 启动本地 Supabase

```bash
# 初始化
supabase init

# 启动本地数据库（需要 Docker）
supabase start

# 执行迁移
supabase db push
```

---

## 数据库表结构说明

### 1. `profiles` - 用户档案表
- 存储用户的个人信息、公司信息
- 通过 Trigger 自动创建（用户注册时）

### 2. `diagnosis_sessions` - 诊断会话表（核心）
- 存储五维诊断数据
- 5 个独立的 JSONB 字段存储各维度数据
- 支持实时更新和查询

### 3. `chat_logs` - 对话记录表
- 存储用户与 AI 的对话历史
- 支持元数据存储（token 消耗等）

### 4. `leads` - 销售线索表
- 仅 Service Role 可访问
- 用于后台管理员管理高意向用户

---

## RLS 安全策略

所有表都启用了 Row Level Security：
- ✅ 用户只能查看/编辑自己的数据
- ✅ Leads 表仅 Admin 可访问
- ✅ 通过 `auth.uid()` 自动验证身份

---

## 常见问题

### Q: 忘记数据库密码怎么办？
A: 在 Supabase Dashboard → Settings → Database → Reset database password

### Q: 如何查看数据库内容？
A: 使用 **Table Editor** 查看和编辑数据

### Q: 如何执行 SQL 查询？
A: 使用 **SQL Editor** 执行自定义查询

### Q: 数据库连接失败？
A: 检查 `.env.local` 中的 URL 和 Key 是否正确

---

## 下一步

配置完成后，继续开发：
1. **Phase 2**: 构建五维诊断对话系统
2. **Phase 3**: 集成 AI 服务（Zhipu/DeepSeek）
3. **Phase 4**: 开发前端组件和界面

---

## 有用的链接

- 📖 [Supabase 文档](https://supabase.com/docs)
- 🎓 [Next.js + Supabase 快速开始](https://supabase.com/docs/guides/with-nextjs)
- 🔧 [Supabase CLI 文档](https://supabase.com/docs/reference/cli)
- 💬 [Supabase Discord 社区](https://discord.gg/supabase)
