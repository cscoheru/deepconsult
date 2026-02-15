# ✅ Supabase 云服务配置清单

## 当前状态
- 项目路径: `/Users/kjonekong/Documents/aiwebsite`
- 开发服务器: 运行在 http://localhost:3001
- 迁移脚本: 已准备就绪

---

## 步骤 1：创建 Supabase 项目（预计 2-3 分钟）

### 操作清单：

- [ ] 打开浏览器访问 https://supabase.com
- [ ] 点击 "Start your project" 或 "Sign In"
- [ ] 使用 GitHub 账号登录/注册
- [ ] 登录后，点击 "New Project"
- [ ] 填写项目表单：
  - **Name**: `deepconsult` (或任意名称)
  - **Database Password**: 设置一个强密码并**保存到密码管理器**
  - **Region**: 选择 `Northeast Asia (Tokyo)` (日本) 或 `Southeast Asia (Singapore)` (新加坡)
- [ ] 点击 "Create new project"
- [ ] 等待项目创建完成（大约 2-3 分钟）

---

## 步骤 2：获取 API 密钥（预计 1 分钟）

### 操作清单：

- [ ] 项目创建完成后，在左侧菜单点击 **Settings** → **API**
- [ ] 你会看到以下信息：

  1. **Project URL**
     ```
     https://xxxxx.supabase.co
     ```
     🔔 **复制这个 URL**

  2. **Project API keys** 下的 **anon public**
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
     🔔 **复制这个 Key**

  3. **Project API keys** 下的 **service_role** (⚠️ 保密！)
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
     🔔 **复制这个 Key**（仅在服务端使用）

- [ ] 将这三个值保存到记事本（下一步要用）

---

## 步骤 3：执行数据库迁移（预计 1 分钟）

### 操作清单：

- [ ] 在 Supabase Dashboard 左侧菜单点击 **SQL Editor**
- [ ] 点击 "New query" 按钮
- [ ] 打开以下文件并复制全部内容：
  ```
  /Users/kjonekong/Documents/aiwebsite/supabase/migrations/001_initial_schema.sql
  ```
- [ ] 粘贴到 SQL Editor 中
- [ ] 点击右下角 **Run** 按钮
- [ ] 确认看到 "Success. No rows returned" 消息
- [ ] 检查右侧 "Tables" 应该看到 4 个表：
  - `profiles`
  - `diagnosis_sessions`
  - `chat_logs`
  - `leads`

---

## 步骤 4：配置环境变量（预计 1 分钟）

### 操作清单：

- [ ] 在项目根目录执行：
  ```bash
  cp .env.local.example .env.local
  ```

- [ ] 编辑 `.env.local` 文件：
  ```bash
  nano .env.local
  # 或使用 VSCode: code .env.local
  ```

- [ ] 填入以下内容（替换为你在步骤 2 获取的实际值）：

  ```env
  # ============================================
  # Supabase Configuration
  # ============================================
  NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

  # ============================================
  # AI Services (暂时留空，稍后配置)
  # ============================================
  ZHIPU_AI_KEY=
  DEEPSEEK_API_KEY=

  # ============================================
  # Application Configuration
  # ============================================
  NEXT_PUBLIC_APP_URL=http://localhost:3001
  ```

---

## 步骤 5：生成 TypeScript 类型（预计 30 秒）

### 方法 1：使用 Project ID（推荐）

- [ ] 从你的 Project URL 中提取 Project ID
  - 例如: `https://abcd1234.supabase.co`
  - Project ID: `abcd1234`

- [ ] 在项目根目录执行：
  ```bash
  npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
  ```

### 方法 2：使用本地链接（备选）

- [ ] 在 Supabase Dashboard 的 SQL Editor 中
- [ ] 点击右上角 "Generate client types" 获取链接
- [ ] 执行命令：
  ```bash
  npx supabase gen types typescript --local > types/database.ts
  ```

---

## 步骤 6：验证配置（预计 1 分钟）

### 操作清单：

- [ ] 重启开发服务器：
  ```bash
  # 在终端按 Ctrl+C 停止当前服务器
  npm run dev
  ```

- [ ] 访问 http://localhost:3001

- [ ] 打开浏览器开发者工具 (F12)

- [ ] 在 Console 中检查是否有 Supabase 连接错误

- [ ] 如果看到页面正常显示且无错误，配置成功！ ✅

---

## 🎯 配置完成后的下一步

1. **测试数据库连接**
   - 创建测试用户
   - 验证 RLS 策略
   - 测试数据读写

2. **配置 AI 服务**
   - 获取 Zhipu AI 或 DeepSeek API Key
   - 集成 AI 服务到项目中

3. **开始 Phase 2 开发**
   - 构建五维诊断对话系统
   - 开发前端组件

---

## ❓ 遇到问题？

### 常见错误：

1. **"Invalid API key"**
   - 检查 `.env.local` 中的 Key 是否正确复制
   - 确认没有多余的空格或换行

2. **"Database connection failed"**
   - 检查 Supabase 项目是否已启动
   - 确认 Project URL 正确

3. **"RLS policy violation"**
   - 这是正常的，说明 RLS 正在工作
   - 需要用户登录后才能访问数据

---

## 📞 需要帮助？

如果你在某个步骤遇到问题，告诉我：
- 你在哪一步卡住了
- 看到了什么错误消息
- 我会帮你解决！

---

**准备好后，告诉我"步骤 X 完成"，我会继续下一步。**
