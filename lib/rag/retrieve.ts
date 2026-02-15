/**
 * RAG Knowledge Base Retrieval
 * 向量检索功能封装
 */

import { createServerClient } from '@/lib/supabase/server';

// ============================================
// 类型定义
// ============================================

export interface DocumentMatch {
  id: string;
  content: string;
  category: string;
  source: string;
  similarity: number;
}

export interface RetrieveOptions {
  category?: 'strategy' | 'structure' | 'performance' | 'compensation' | 'talent';
  threshold?: number; // 相似度阈值 (0-1)，默认 0.7
  topK?: number; // 返回结果数量，默认 5
}

// ============================================
// Embedding 生成
// ============================================

/**
 * 生成查询文本的 embedding
 *
 * @param query - 查询文本
 * @returns 1536 维向量数组
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const provider = process.env.EMBEDDING_PROVIDER as 'openai' | 'zhipu' || 'openai';

  if (provider === 'openai') {
    return await generateOpenAIEmbedding(query);
  } else {
    return await generateZhipuEmbedding(query);
  }
}

/**
 * OpenAI Embedding API
 */
async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * 智谱 Embedding API
 */
async function generateZhipuEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    throw new Error('ZHIPU_API_KEY is not configured');
  }

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'embedding-3',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zhipu API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// ============================================
// 向量检索
// ============================================

/**
 * 使用向量相似度搜索相关文档
 *
 * @param query - 查询文本
 * @param options - 检索选项
 * @returns 匹配的文档列表
 *
 * @example
 * ```typescript
 * const matches = await retrieveDocuments("如何提升组织执行力？", {
 *   category: "strategy",
 *   threshold: 0.75,
 *   topK: 3
 * });
 *
 * console.log(matches);
 * // [
 * //   {
 * //     id: "...",
 * //     content: "提升执行力的关键在于...",
 * //     category: "strategy",
 * //     source: "docs/strategy/execution.md",
 * //     similarity: 0.89
 * //   },
 * //   ...
 * // ]
 * ```
 */
export async function retrieveDocuments(
  query: string,
  options: RetrieveOptions = {}
): Promise<DocumentMatch[]> {
  const {
    category,
    threshold = 0.7,
    topK = 5,
  } = options;

  try {
    // 1. 生成查询 embedding
    const embedding = await generateQueryEmbedding(query);

    // 2. 调用 Supabase RPC 函数
    const supabase = await createServerClient();

    // 将 embedding 数组转换为 pgvector 格式 string
    const embeddingString = `[${embedding.join(',')}]`;

    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embeddingString,
      category_filter: category || null,
      match_threshold: threshold,
      top_k: topK,
    });

    if (error) {
      console.error('Vector search error:', error);
      throw error;
    }

    return (data || []) as DocumentMatch[];

  } catch (error) {
    console.error('Document retrieval failed:', error);
    throw error;
  }
}

/**
 * 检索文档并格式化为上下文（用于 AI 对话）
 *
 * @param query - 查询文本
 * @param options - 检索选项
 * @returns 格式化的上下文字符串
 */
export async function retrieveDocumentsAsContext(
  query: string,
  options: RetrieveOptions = {}
): Promise<string> {
  const docs = await retrieveDocuments(query, options);

  if (docs.length === 0) {
    return 'No relevant information found in the knowledge base.';
  }

  const context = docs
    .map((doc, index) => {
      return `[Source ${index + 1}] ${doc.source}\n${doc.content}\n[Similarity: ${(doc.similarity * 100).toFixed(1)}%]`;
    })
    .join('\n\n---\n\n');

  return context;
}

// ============================================
// 知识库统计
// ============================================

export interface KnowledgeStats {
  category: string;
  doc_count: number;
  avg_chunk_count: number;
}

/**
 * 获取知识库统计信息
 */
export async function getKnowledgeStats(): Promise<KnowledgeStats[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('get_knowledge_stats');

  if (error) {
    console.error('Failed to get knowledge stats:', error);
    throw error;
  }

  return (data || []) as KnowledgeStats[];
}

/**
 * 检查知识库是否已初始化
 */
export async function isKnowledgeBaseReady(): Promise<boolean> {
  try {
    const stats = await getKnowledgeStats();
    const totalDocs = stats.reduce((sum, stat) => sum + stat.doc_count, 0);
    return totalDocs > 0;
  } catch {
    return false;
  }
}

// ============================================
// Server Action (用于客户端调用)
// ============================================

/**
 * Server Action: 检索相关文档
 */
export async function searchKnowledgeBase(
  query: string,
  options?: RetrieveOptions
): Promise<{ data: DocumentMatch[] | null; error: Error | null }> {
  try {
    const results = await retrieveDocuments(query, options);
    return { data: results, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
