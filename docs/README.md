# RAG 知识库系统使用指南

## 📚 目录结构

```
docs/
├── strategy/          # 战略维度文档
│   └── strategic-alignment.md
├── structure/         # 组织结构维度文档
│   └── organizational-design.md
├── performance/       # 绩效管理维度文档
│   └── performance-management.md
├── compensation/      # 薪酬激励维度文档
│   └── compensation-strategy.md
├── talent/           # 人才发展维度文档
│   └── talent-management.md
└── README.md         # 本文件
```

## 🚀 快速开始

### 1. 配置环境变量

复制 `.env.rag.example` 到 `.env.local` 并填入真实值：

```bash
cp .env.rag.example .env.local
```

必需的环境变量：
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url
SUPABASE_SERVICE_KEY=your-service-role-key

# Embedding API (二选一)
OPENAI_API_KEY=sk-xxx
# 或
ZHIPU_API_KEY=your-key
EMBEDDING_PROVIDER=openai  # 或 'zhipu'
```

### 2. 执行数据库迁移

在 Supabase Dashboard → SQL Editor 执行：

```sql
-- 文件: supabase/migrations/004_add_vector_extension.sql
```

这会：
- ✅ 启用 pgvector 扩展
- ✅ 创建 knowledge_docs 表
- ✅ 创建索引（HNSW + GIN）
- ✅ 创建 RLS 策略
- ✅ 创建 match_documents RPC 函数

### 3. 运行文档入库

```bash
npm run ingest:docs
```

这会：
- 📂 读取 docs/ 下所有 .md 和 .txt 文件
- ✂️ 自动切分文档（chunk_size=500, overlap=50）
- 🧠 生成 embeddings（OpenAI 或 智谱）
- 💾 存入 Supabase knowledge_docs 表

### 4. 查看统计信息

```typescript
import { getKnowledgeStats } from '@/lib/rag/retrieve';

const stats = await getKnowledgeStats();
console.table(stats);
```

输出示例：
```
┌─────────────┬───────────┬──────────────────┐
│  category   │ doc_count │ avg_chunk_count  │
├─────────────┼───────────┼──────────────────┤
│ compensation│    15     │       8.5        │
│ performance │    23     │       12.3       │
│ strategy    │    18     │       10.2       │
│ structure   │    20     │       11.1       │
│ talent      │    17     │       9.8        │
└─────────────┴───────────┴──────────────────┘
```

## 🔍 使用示例

### 基础检索

```typescript
import { retrieveDocuments } from '@/lib/rag/retrieve';

// 检索相关文档
const matches = await retrieveDocuments('如何提升组织执行力？', {
  category: 'strategy',      // 可选：限定类别
  threshold: 0.75,           // 可选：相似度阈值（默认0.7）
  topK: 5,                   // 可选：返回数量（默认5）
});

// 使用检索结果
matches.forEach(doc => {
  console.log(`${doc.source} (${doc.similarity.toFixed(2)})`);
  console.log(doc.content);
  console.log('---');
});
```

### 生成 AI 上下文

```typescript
import { retrieveDocumentsAsContext } from '@/lib/rag/retrieve';

// 获取格式化的上下文（用于 AI 对话）
const context = await retrieveDocumentsAsContext(
  'OKR 和 KPI 有什么区别？',
  { category: 'performance', topK: 3 }
);

// 调用 AI 时传入 context
const aiResponse = await callAI(context);
```

### Server Action（客户端调用）

```typescript
'use client';
import { searchKnowledgeBase } from '@/lib/actions';

export default function SearchComponent() {
  const handleSearch = async () => {
    const { data, error } = await searchKnowledgeBase(
      '如何设计薪酬体系？',
      { category: 'compensation', topK: 3 }
    );

    if (data) {
      console.log('Found docs:', data);
    }
  };

  return <button onClick={handleSearch}>搜索</button>;
}
```

## 📝 文档编写规范

### 1. 文件命名

使用清晰的英文文件名：
- ✅ `strategic-alignment.md`
- ❌ `doc1.md`

### 2. 文档结构

每个文档应包含：
- 标题（#）
- 简短介绍
- 核心内容（分节）
- 示例/案例
- 关键要点

### 3. 类别标注

在文档末尾添加元数据：

```markdown
---

**Category**: strategy
**Tags**: 战略清晰度, 目标对齐
**Related**: structure, performance
```

入库脚本会根据文件名、内容、元数据自动检测类别。

### 4. 内容质量

- ✅ 原创内容，避免直接复制
- ✅ 结构清晰，易于检索
- ✅ 包含实践案例和具体建议
- ✅ 字数建议：单篇 1000-3000 字

## 🛠️ 高级功能

### 1. 按类别检索

```typescript
// 只在 strategy 类别中搜索
const matches = await retrieveDocuments(query, {
  category: 'strategy',
});
```

### 2. 调整相似度阈值

```typescript
// 更严格的阈值（只返回高度相关的文档）
const matches = await retrieveDocuments(query, {
  threshold: 0.85,
});

// 更宽松的阈值（返回更多可能相关的文档）
const matches = await retrieveDocuments(query, {
  threshold: 0.6,
});
```

### 3. 批量检索

```typescript
// 同时检索多个类别
const categories = ['strategy', 'structure'] as const;
const results = await Promise.all(
  categories.map(cat =>
    retrieveDocuments(query, { category: cat, topK: 3 })
  )
);
```

### 4. 混合检索（向量 + 关键词）

```typescript
// 1. 向量检索
const vectorMatches = await retrieveDocuments(query);

// 2. 关键词过滤
const keywordFiltered = vectorMatches.filter(doc =>
  doc.content.toLowerCase().includes('okr')
);

console.log(keywordFiltered);
```

## 📊 成本估算

### OpenAI Embedding (text-embedding-3-small)

- 价格: $0.00002 / 1K tokens
- 假设平均每个 chunk 500 tokens
- 1000 个文档 chunk ≈ $0.01

### 智谱 Embedding (embedding-3)

- 价格: ¥0.0005 / 1K tokens
- 1000 个文档 chunk ≈ ¥0.25

### 存储成本

Supabase 免费套餐包含：
- 500MB 数据库存储
- 1个向量索引（HNSW）

1000个文档 chunk ≈ 5MB（含向量）

## ⚠️ 常见问题

### Q1: 入库脚本报错 "OPENAI_API_KEY is required"

**A**: 检查 `.env.local` 是否正确配置 API Key。

### Q2: 检索结果为空

**A**: 可能原因：
1. 相似度阈值太高 → 降低 `threshold` 到 0.6
2. 知识库没有相关文档 → 添加更多文档
3. 查询与文档语言不匹配 → 确保都是中文或都是英文

### Q3: embedding 生成很慢

**A**: 优化建议：
1. 使用批量 API（已实现）
2. 切换到智谱（国内网络更快）
3. 减少文档数量或增大 chunk_size

### Q4: 如何更新已有文档？

**A**:
1. 修改 docs/ 下的文件
2. 删除旧记录：
   ```sql
   SELECT delete_docs_by_source('docs/strategy/xxx.md');
   ```
3. 重新运行 `npm run ingest:docs`

## 🔗 相关链接

- [pgvector 文档](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [智谱 AI Embedding](https://open.bigmodel.cn/dev/api#embedding)
- [Supabase Vector Docs](https://supabase.com/docs/guides/ai/vector-columns)

---

**最后更新**: 2026-02-15
**版本**: v1.0.0
