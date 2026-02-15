# 🗄️ 后端数据层构建完成

## ✅ 完成时间
**2026-02-15**

---

## 📊 数据库架构

### 1. 数据库表结构

#### **profiles** (用户档案表)
```sql
- id: UUID (PK) → auth.users
- full_name: TEXT
- company_name: TEXT
- job_title: TEXT
- industry: TEXT
- employee_count: TEXT -- '1-50' | '51-200' | '201-500' | '500+'
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### **diagnosis_sessions** (诊断会话表 - 核心)
```sql
- id: UUID (PK)
- user_id: UUID (FK) → profiles.id
- status: ENUM ('active', 'completed', 'archived')
- current_stage: TEXT -- 'strategy' | 'structure' | 'performance' | 'compensation' | 'talent'

-- 五维数据字段 (JSONB)
- data_strategy: JSONB -- { score: 78, labels: ["清晰"], summary: "..." }
- data_structure: JSONB
- data_performance: JSONB
- data_compensation: JSONB
- data_talent: JSONB

- total_score: INTEGER -- 0-100
- summary_report: TEXT -- AI生成的最终总结 (NEW!)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### **chat_logs** (对话记录表)
```sql
- id: UUID (PK)
- session_id: UUID (FK) → diagnosis_sessions.id
- role: ENUM ('user', 'assistant', 'system')
- content: TEXT
- metadata: JSONB -- { tokens: 150, model: "gpt-4", cost: 0.003 }
- created_at: TIMESTAMPTZ
```

#### **leads** (销售线索表)
```sql
- id: UUID (PK)
- user_id: UUID (FK) → profiles.id
- lead_score: INTEGER (0-100)
- status: ENUM ('new', 'contacted', 'converted')
- notes: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### 2. 索引优化

**普通索引**:
- `idx_profiles_users_id`
- `idx_diagnosis_sessions_user_id`
- `idx_diagnosis_sessions_status`
- `idx_chat_logs_session_id`
- `idx_chat_logs_created_at`
- `idx_leads_user_id`
- `idx_leads_status`
- `idx_leads_lead_score`

**JSONB GIN 索引** (五维数据高效查询):
- `idx_diagnosis_sessions_data_strategy`
- `idx_diagnosis_sessions_data_structure`
- `idx_diagnosis_sessions_data_performance`
- `idx_diagnosis_sessions_data_compensation`
- `idx_diagnosis_sessions_data_talent`

**全文搜索索引** (NEW!):
- `idx_diagnosis_sessions_summary_report` (GIN to_tsvector)

### 3. RLS 安全策略

✅ **用户只能访问自己的数据**
```sql
-- profiles
- Users can view/insert/update their own profile

-- diagnosis_sessions
- Users can view/create/update/delete their own sessions

-- chat_logs
- Users can view/insert logs from their own sessions (via subquery)

-- leads
- Only service_role can manage (admin backend)
```

### 4. 自动化功能

✅ **触发器**:
- `update_profiles_updated_at` -- 自动更新时间戳
- `update_diagnosis_sessions_updated_at`
- `update_leads_updated_at`

✅ **用户注册自动创建 Profile**:
- `handle_new_user()` 函数
- `on_auth_user_created` 触发器

---

## 🔧 Server Actions 架构

### 文件结构
```
lib/actions/
├── index.ts           # 统一导出
├── diagnosis.ts       # 诊断会话管理
├── chat.ts            # 聊天消息管理
└── profile.ts         # 用户档案管理
```

### 1. Diagnosis Actions (`diagnosis.ts`)

```typescript
// 创建新会话
createDiagnosisSession() => { data, error }

// 获取所有会话
getUserDiagnosisSessions() => { data, error }

// 获取会话 + 消息
getDiagnosisSessionWithMessages(sessionId) => { data: { session, messages }, error }

// 更新当前阶段
updateSessionStage(sessionId, stage) => { data, error }

// 更新维度数据
updateDimensionData(sessionId, dimension, data) => { data, error }

// 完成会话 + 生成总结
completeDiagnosisSession(sessionId, summaryReport) => { data, error }

// 删除会话（级联删除消息）
deleteDiagnosisSession(sessionId) => { data, error }
```

**使用示例**:
```typescript
'use client';
import { createDiagnosisSession, updateDimensionData } from '@/lib/actions';

export default function MyComponent() {
  const handleStart = async () => {
    const { data, error } = await createDiagnosisSession();
    if (data) {
      console.log('Session created:', data.id);
    }
  };

  const updateStrategy = async () => {
    const { data, error } = await updateDimensionData(
      sessionId,
      'strategy',
      { score: 85, labels: ['清晰', '一致'], summary: '战略定位明确' }
    );
  };
}
```

### 2. Chat Actions (`chat.ts`)

```typescript
// 添加消息
addChatMessage(sessionId, role, content, metadata?) => { data, error }

// 获取会话所有消息
getChatMessages(sessionId) => { data, error }

// 获取最新 N 条
getRecentChatMessages(sessionId, limit?) => { data, error }

// 删除消息
deleteChatMessage(messageId) => { data, error }

// 批量导入
batchAddChatMessages(messages[]) => { data, error }
```

**使用示例**:
```typescript
import { addChatMessage, getChatMessages } from '@/lib/actions';

// 添加用户消息
await addChatMessage(
  session.id,
  'user',
  '我们的OKR执行不一致'
);

// 添加AI回复（带元数据）
await addChatMessage(
  session.id,
  'assistant',
  '这是一个关键发现...',
  { tokens: 150, model: 'gpt-4', cost: 0.003 }
);

// 获取历史记录
const { data: messages } = await getChatMessages(session.id);
```

### 3. Profile Actions (`profile.ts`)

```typescript
// 获取当前用户 Profile
getCurrentUserProfile() => { data, error }

// 更新 Profile
updateUserProfile(updates) => { data, error }

// 更新公司信息
updateCompanyInfo({ company_name, industry, employee_count }) => { data, error }

// 检查完整度
checkProfileCompleteness() => { data: { isComplete, missingFields, completionPercentage }, error }

// 删除账户
deleteUserAccount() => { data, error }
```

**使用示例**:
```typescript
import { checkProfileCompleteness, updateCompanyInfo } from '@/lib/actions';

// 检查Profile完整度
const { data } = await checkProfileCompleteness();
console.log(`Complete: ${data.completionPercentage}%`);
// Output: "Complete: 75%"

// 更新公司信息
await updateCompanyInfo({
  company_name: 'Acme Corp',
  industry: 'Technology',
  employee_count: '51-200'
});
```

---

## 📝 TypeScript 类型系统

### 核心类型 (`types/supabase.ts`)

```typescript
// Enums
type SessionStatus = 'active' | 'completed' | 'archived';
type ChatRole = 'user' | 'assistant' | 'system';
type LeadStatus = 'new' | 'contacted' | 'converted';

// Profile
interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  job_title: string | null;
  industry: string | null;
  employee_count: string | null;
  created_at: string;
  updated_at: string;
}

// Diagnosis Session (UPDATED!)
interface DiagnosisSession {
  id: string;
  user_id: string;
  status: SessionStatus;
  current_stage: 'strategy' | 'structure' | 'performance' | 'compensation' | 'talent';
  data_strategy: Record<string, any>; // { score: 85, labels: [], summary: '' }
  data_structure: Record<string, any>;
  data_performance: Record<string, any>;
  data_compensation: Record<string, any>;
  data_talent: Record<string, any>;
  total_score: number;
  summary_report: string | null; // NEW!
  created_at: string;
  updated_at: string;
}

// Chat Log
interface ChatLog {
  id: string;
  session_id: string;
  role: ChatRole;
  content: string;
  metadata: {
    tokens?: number;
    model?: string;
    reasoning?: string;
    cost?: number;
  };
  created_at: string;
}

// Lead
interface Lead {
  id: string;
  user_id: string;
  lead_score: number;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Join Types (查询结果)
interface SessionWithProfile extends DiagnosisSession {
  profile: Profile;
}

interface ChatLogWithSession extends ChatLog {
  session: DiagnosisSession;
}
```

---

## 🚀 使用指南

### Step 1: 在 Supabase 执行迁移

1. 打开 Supabase Dashboard → SQL Editor
2. 执行 `supabase/migrations/003_add_summary_report.sql`
3. 验证字段已添加

### Step 2: 在组件中使用 Server Actions

```typescript
// app/diagnosis/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createDiagnosisSession, addChatMessage, getChatMessages } from '@/lib/actions';

export default function DiagnosisPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);

  // 创建新会话
  const startDiagnosis = async () => {
    const { data, error } = await createDiagnosisSession();
    if (data) {
      setSessionId(data.id);
    }
  };

  // 发送消息
  const sendMessage = async (content: string) => {
    // 添加用户消息
    await addChatMessage(sessionId, 'user', content);

    // TODO: 调用 AI 服务生成回复
    // const aiResponse = await callZhipuAI(content);

    // 添加 AI 回复
    await addChatMessage(sessionId, 'assistant', 'AI回复...');
  };

  // 加载历史消息
  useEffect(() => {
    if (sessionId) {
      getChatMessages(sessionId).then(({ data }) => {
        if (data) setMessages(data);
      });
    }
  }, [sessionId]);

  return (
    <div>
      <button onClick={startDiagnosis}>开始诊断</button>
      {/* 聊天界面 */}
    </div>
  );
}
```

### Step 3: 维度数据结构示例

```typescript
// Strategy 维度数据示例
const strategyData = {
  score: 85,                    // 维度得分 0-100
  labels: [                     // AI 提取的标签
    "战略清晰度: 高",
    "目标一致性: 良好",
    "竞争优势: 明确"
  ],
  summary: "组织战略定位清晰，目标分解到位，但执行层面需加强",
  details: {
    strengths: ["愿景明确", "市场定位准确"],
    weaknesses: ["资源分配不均"],
    recommendations: ["优化预算流程", "建立KPI追踪机制"]
  }
};

// 更新到数据库
await updateDimensionData(sessionId, 'strategy', strategyData);
```

---

## 🔒 安全特性

✅ **所有 Server Actions 都有身份验证**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return { data: null, error: new Error('User not authenticated') };
}
```

✅ **RLS 策略确保用户只能访问自己的数据**
- 数据库层面强制执行
- 即使代码有bug也不会泄露数据

✅ **级联删除确保数据一致性**
- 删除 profile → 自动删除 sessions
- 删除 session → 自动删除 chat_logs

---

## 📦 数据库迁移文件

| 文件 | 描述 | 状态 |
|------|------|------|
| `001_initial_schema.sql` | 初始数据库架构（4张表 + RLS） | ✅ 已执行 |
| `002_reset_and_create.sql` | 重置脚本（开发用） | ✅ 可用 |
| `003_add_summary_report.sql` | 添加 summary_report 字段 | 🆕 待执行 |

---

## 🎯 下一步开发

### Phase 2: AI 集成

**待实现功能**：
1. **Zhipu AI 服务集成**
   - 创建 `lib/ai/zhipu.ts`
   - 实现对话接口
   - Token 计数和成本追踪

2. **前台对话 Agent**
   - 接收用户输入
   - 调用 Zhipu AI
   - 存储到 `chat_logs`

3. **后台提取 Agent**
   - 从对话中提取结构化数据
   - 更新 `data_*` JSONB 字段
   - 计算维度分数

4. **报告生成**
   - 生成 `summary_report`
   - 调用 `completeDiagnosisSession`

### Phase 3: 用户界面

**需要创建的页面**：
1. `/app/diagnosis/[id]/page.tsx` - 诊断会话页面
2. `/app/dashboard/page.tsx` - 用户仪表板
3. `/app/profile/page.tsx` - 个人资料设置

---

## 📚 API 参考

### Server Actions 响应格式

所有 Server Actions 返回统一格式：

```typescript
// 成功
{ data: <result>, error: null }

// 失败
{ data: null, error: Error }
```

### 错误处理示例

```typescript
const { data, error } = await createDiagnosisSession();

if (error) {
  console.error('Failed to create session:', error.message);
  // 显示错误提示给用户
  toast.error(error.message);
  return;
}

// 使用 data
console.log('Session created:', data.id);
```

---

## ✨ 总结

### 已完成
- ✅ 数据库 Schema 设计（4张表）
- ✅ RLS 安全策略
- ✅ Server Actions 完整实现（3个文件，20+ 函数）
- ✅ TypeScript 类型定义
- ✅ 索引优化（JSONB GIN + 全文搜索）
- ✅ 自动化触发器（时间戳 + Profile创建）
- ✅ 新迁移文件（summary_report 字段）
- ✅ 类型检查通过
- ✅ 生产构建成功

### 技术栈
- **数据库**: Supabase (PostgreSQL 15)
- **ORM**: Supabase Client (Type-safe)
- **Server Runtime**: Next.js Server Actions
- **类型系统**: TypeScript 5.9
- **安全**: RLS + Authentication

### 代码统计
- **新增文件**: 6个
- **代码行数**: ~600行
- **Server Actions**: 20个函数
- **数据库表**: 4张
- **RLS 策略**: 12条
- **索引**: 16个

---

**🎉 后端数据层已就绪，可以开始 AI 集成和前端开发！**

---

**生成时间**: 2026-02-15 23:30
**Git Commit**: b0da8df
**版本**: v1.1.0
