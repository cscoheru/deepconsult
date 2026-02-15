# 🚀 Vercel 部署指南

## ✅ GitHub 部署完成

**仓库地址**: https://github.com/cscoheru/deepconsult.git
**状态**: 代码已成功推送

---

## 📋 Vercel 部署步骤

### 方案 A：通过 Vercel Dashboard（推荐）

#### 1. 登录 Vercel
访问 https://vercel.com/login

#### 2. 导入 GitHub 仓库
- 点击 **"Add New..."** → **"Project"**
- 选择 **"Import Git Repository"**
- 找到并选择 **`deepconsult`** 仓库
- 点击 **"Import"**

#### 3. 配置项目

**基础配置**:
- **Project Name**: `deepconsult` (或自定义)
- **Framework Preset**: `Next.js` (自动检测)
- **Root Directory**: `./` (根目录)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

**环境变量** (在 "Environment Variables" 部分添加):

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://cnximbkrryvvbyyjtxwc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueGltYmtycnl2dmJ5eWp0eHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTYxNDUsImV4cCI6MjA4NjY5MjE0NX0.Jcvp02gymPgf86H8nACHVXIdXOxPe4o6acSxPaUv86U
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueGltYmtycnl2dmJ5eWp0eHdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTExNjE0NSwiZXhwIjoyMDg2NjkyMTQ1fQ.fINLsr6DY4tAvkrUyLN2DY13iVTeCAeeIg_02HZF0Nk

# AI 服务
ZHIPU_AI_KEY=9689f59575bd417b94e59d3d5e7041df.BU0UX7rmpTHun4BQ
DEEPSEEK_API_KEY=your-deepseek-api-key

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### 4. 部署
- 点击 **"Deploy"** 按钮
- 等待 2-3 分钟
- 部署成功后会获得一个 URL：`https://deepconsult.vercel.app`

---

### 方案 B：通过 Vercel CLI（快速）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署项目
cd /Users/kjonekong/Documents/aiwebsite
vercel

# 按提示操作：
# - Link to existing project? No
# - Project name: deepconsult
# - Directory: ./
# - Override settings? No (使用默认配置)

# 4. 添加环境变量
# 访问 https://vercel.com/deepconsult/settings/environment-variables
# 手动添加上述环境变量

# 5. 重新部署
vercel --prod
```

---

## ⚙️ 环境变量说明

### 必须配置（4个）

| 变量名 | 说明 | 是否必须 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ 必须 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公开密钥 | ✅ 必须 |
| `ZHIPU_AI_KEY` | 智谱 AI 密钥 | ✅ 必须（AI 对话） |
| `NEXT_PUBLIC_APP_URL` | 应用 URL | ✅ 必须 |

### 可选配置（1个）

| 变量名 | 说明 |
|--------|------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥（Admin 功能） |
| `DEEPSEEK_API_KEY` | DeepSeek AI 密钥（备用 AI） |

---

## 🎯 部署后检查清单

部署完成后，访问你的 Vercel URL 并检查：

### 基础功能
- [ ] 首页正常显示
- [ ] 主题切换工作（亮色/暗色）
- [ ] 导航菜单响应式
- [ ] 所有组件正常渲染

### 五维模型展示
- [ ] Strategy (战略) 卡片显示
- [ ] Structure (组织结构) 卡片显示
- [ ] Performance (绩效管理) 卡片显示
- [ ] Compensation (薪酬激励) 卡片显示
- [ ] Talent (人才发展) 卡片显示

### 工具展示
- [ ] 工具切换标签页工作
- [ ] 进度条动画显示
- [ ] 指标卡片显示

### AI 聊天组件
- [ ] 聊天界面显示
- [ ] 输入框工作
- [ ] 建议提示词可点击
- [ ] 模拟 AI 响应显示（暂时）

---

## 🔧 常见问题

### Q1: 部署后环境变量未生效
**A**:
1. 在 Vercel Dashboard 检查环境变量是否正确添加
2. 点击 "Redeploy" 重新部署
3. 确认变量名拼写正确（区分大小写）

### Q2: Supabase 连接失败
**A**:
1. 检查 `NEXT_PUBLIC_SUPABASE_URL` 是否正确
2. 确认 Supabase 项目是否已启动（非暂停状态）
3. 检查 RLS 策略是否正确配置

### Q3: 样式显示异常
**A**:
1. 检查 Tailwind CSS 配置
2. 确认 `@tailwindcss/postcss` 已安装
3. 清除浏览器缓存重试

### Q4: 构建失败
**A**:
1. 查看构建日志
2. 检查依赖版本冲突
3. 尝试 `npm install` 后重新推送

---

## 🌐 域名配置（可选）

### 使用自定义域名

1. 在 Vercel Dashboard 进入 **Settings** → **Domains**
2. 添加你的域名（如 `deepconsult.com`）
3. 配置 DNS 记录：
   - 类型: `A` 或 `CNAME`
   - 名称: `@` 或 `www`
   - 值: Vercel 提供的目标

---

## 📊 监控和分析

Vercel 提供的内置功能：
- **Analytics**: 访问量、性能指标
- **Logs**: 部署日志、错误日志
- **Speed Insights**: 页面加载速度
- **Deployment History**: 部署历史

访问 https://vercel.com/deepconsult 查看

---

## 🔄 持续部署

配置完成后，每次推送到 `main` 分支会自动触发部署：

```bash
git add .
git commit -m "feat: New feature"
git push origin main
```

Vercel 会自动：
1. 检测到代码变更
2. 触发构建
3. 运行测试（如果配置）
4. 部署到生产环境

---

## 📝 总结

### ✅ 已完成
- [x] Git 仓库初始化
- [x] 代码推送到 GitHub
- [x] 创建 Vercel 配置文件

### ⏳ 待完成
- [ ] 在 Vercel 导入项目
- [ ] 配置环境变量
- [ ] 首次部署
- [ ] 验证功能

### 🎉 下一步
按照**方案 A**或**方案 B**完成 Vercel 部署即可！

---

**需要帮助？**
- Vercel 文档: https://vercel.com/docs
- GitHub 仓库: https://github.com/cscoheru/deepconsult
