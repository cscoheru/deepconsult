-- ============================================
-- Migration: Enable pgvector and Create Knowledge Base
-- Version: 004
-- Date: 2026-02-15
-- ============================================

-- Step 1: Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- Step 2: Create knowledge_docs table
-- ============================================
CREATE TABLE IF NOT EXISTS public.knowledge_docs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI/智谱 embedding dimension
  category TEXT NOT NULL, -- 'strategy' | 'structure' | 'performance' | 'compensation' | 'talent'
  source TEXT NOT NULL, -- 来源文件名
  chunk_index INTEGER DEFAULT 0, -- 切片索引（文档被切分后的序号）
  metadata JSONB DEFAULT '{}', -- 额外元数据（如作者、日期等）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Step 3: Create Indexes
-- ============================================

-- HNSW 索引用于高效的向量近似搜索（推荐）
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_embedding_hnsw
ON public.knowledge_docs
USING HNSW (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 类别索引（用于过滤）
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_category
ON public.knowledge_docs(category);

-- 来源索引（用于去重和溯源）
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_source
ON public.knowledge_docs(source);

-- 全文搜索索引（用于混合检索）
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_content_fts
ON public.knowledge_docs USING GIN(to_tsvector('english', content));

-- ============================================
-- Step 4: RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE public.knowledge_docs ENABLE ROW LEVEL SECURITY;

-- 所有用户可以读取知识库
CREATE POLICY "All users can view knowledge docs"
  ON public.knowledge_docs FOR SELECT
  TO authenticated
  USING (true);

-- 仅 service_role 可以插入/更新/删除（管理员维护）
CREATE POLICY "Service role can manage knowledge docs"
  ON public.knowledge_docs FOR ALL
  TO service_role
  USING (true);

-- ============================================
-- Step 5: RPC Function - Match Documents
-- ============================================

/**
 * match_documents(query_embedding, category, match_threshold, top_k)
 *
 * 根据查询向量返回最相似的文档
 *
 * @param query_embedding: vector(1536) - 查询文本的 embedding
 * @param category: text | null - 可选，限制在特定类别
 * @param match_threshold: float | null - 相似度阈值 (0-1)，默认 0.7
 * @param top_k: integer | null - 返回结果数量，默认 5
 *
 * @return: TABLE(id, content, category, source, similarity)
 */
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(1536),
  category_filter TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.7,
  top_k INTEGER DEFAULT 5
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  category TEXT,
  source TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_docs.id,
    knowledge_docs.content,
    knowledge_docs.category,
    knowledge_docs.source,
    1 - (knowledge_docs.embedding <=> query_embedding) AS similarity -- Cosine similarity
  FROM public.knowledge_docs
  WHERE
    -- 可选类别过滤
    (category_filter IS NULL OR knowledge_docs.category = category_filter)
    -- 相似度阈值过滤
    AND (1 - (knowledge_docs.embedding <=> query_embedding)) >= match_threshold
  ORDER BY
    knowledge_docs.embedding <=> query_embedding -- 按距离升序（最相似在前）
  LIMIT top_k;
END;
$$;

-- ============================================
-- Step 6: Helper Functions
-- ============================================

/**
 * 获取知识库统计信息
 */
CREATE OR REPLACE FUNCTION public.get_knowledge_stats()
RETURNS TABLE(
  category TEXT,
  doc_count BIGINT,
  avg_chunk_count NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    category,
    COUNT(*) as doc_count,
    AVG(chunk_index + 1)::NUMERIC(10,2) as avg_chunk_count
  FROM public.knowledge_docs
  GROUP BY category
  ORDER BY category;
END;
$$;

/**
 * 清空并重新导入指定来源的文档
 */
CREATE OR REPLACE FUNCTION public.delete_docs_by_source(source_name TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count BIGINT;
BEGIN
  DELETE FROM public.knowledge_docs
  WHERE source = source_name;

  GET DIAGNOSTICS deleted_count ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ============================================
-- Step 7: Add Comments for Documentation
-- ============================================

COMMENT ON TABLE public.knowledge_docs IS 'RAG knowledge base: stores document chunks with embeddings for semantic search';

COMMENT ON COLUMN public.knowledge_docs.embedding IS 'Vector embedding using OpenAI/智谱 API (dimension: 1536)';

COMMENT ON COLUMN public.knowledge_docs.category IS 'Maps to five dimensions: strategy | structure | performance | compensation | talent';

COMMENT ON FUNCTION public.match_documents IS 'Semantic search function using cosine similarity. Returns top-k most relevant document chunks.';

-- ============================================
-- Verification Queries
-- ============================================

-- Check if pgvector is enabled
-- SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check table structure
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'knowledge_docs';

-- Test RPC function (requires valid embedding)
-- SELECT * FROM match_documents('[0.1, 0.2, ...]'::vector(1536), 'strategy', 0.7, 5);
