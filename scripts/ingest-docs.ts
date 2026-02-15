#!/usr/bin/env tsx
/**
 * RAG Knowledge Base Ingestion Script
 *
 * 功能：
 * 1. 读取 docs/ 目录下的 Markdown/TXT 文件
 * 2. 自动切分文档（按段落或token数）
 * 3. 调用 Embedding API 生成向量
 * 4. 存入 Supabase knowledge_docs 表
 *
 * 使用方法：
 *   npm run ingest:docs
 *   或
 *   tsx scripts/ingest-docs.ts
 *
 * 环境变量：
 *   - SUPABASE_URL: Supabase 项目 URL
 *   - SUPABASE_SERVICE_KEY: Supabase Service Role Key
 *   - OPENAI_API_KEY: OpenAI API Key（可选，默认）
 *   - ZHIPU_API_KEY: 智谱 API Key（可选）
 *   - EMBEDDING_PROVIDER: 'openai' | 'zhipu' (默认: openai)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// ============================================
// 配置
// ============================================

const CONFIG = {
  docsDir: join(process.cwd(), 'docs'),
  chunkSize: 500, // 每块字符数（可调整）
  chunkOverlap: 50, // 块之间重叠字符数
  categories: {
    strategy: ['strategy', '战略', 'strategic', '策略'],
    structure: ['structure', '组织', 'organization', '架构', 'structural'],
    performance: ['performance', '绩效', 'kpi', 'okr', 'performance'],
    compensation: ['compensation', '薪酬', '薪资', 'reward', 'salary'],
    talent: ['talent', '人才', 'hr', '人力资源', 'personnel'],
  },
};

// ============================================
// 类型定义
// ============================================

interface DocumentChunk {
  content: string;
  category: string;
  source: string;
  chunkIndex: number;
  metadata: Record<string, any>;
}

interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// ============================================
// Embedding Service
// ============================================

class EmbeddingService {
  private provider: 'openai' | 'zhipu';
  private apiKey!: string; // Definite assignment assertion

  constructor() {
    this.provider = (process.env.EMBEDDING_PROVIDER as 'openai' | 'zhipu') || 'openai';

    if (this.provider === 'openai') {
      this.apiKey = process.env.OPENAI_API_KEY || '';
      if (!this.apiKey) {
        throw new Error('OPENAI_API_KEY is required when using OpenAI');
      }
    } else if (this.provider === 'zhipu') {
      this.apiKey = process.env.ZHIPU_API_KEY || '';
      if (!this.apiKey) {
        throw new Error('ZHIPU_API_KEY is required when using Zhipu');
      }
    }
  }

  /**
   * 生成单个文本的 embedding
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (this.provider === 'openai') {
        return await this.openaiEmbedding(text);
      } else {
        return await this.zhipuEmbedding(text);
      }
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * OpenAI Embedding API
   * 模型: text-embedding-3-small (1536 dimensions)
   */
  private async openaiEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
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
   * 模型: embedding-3 (1536 dimensions)
   */
  private async zhipuEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
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

  /**
   * 批量生成 embeddings（优化性能）
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    console.log(`Generating ${texts.length} embeddings...`);
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i++) {
      const embedding = await this.generateEmbedding(texts[i]);
      embeddings.push(embedding);

      if ((i + 1) % 10 === 0) {
        console.log(`Progress: ${i + 1}/${texts.length}`);
      }
    }

    return embeddings;
  }
}

// ============================================
// Document Processing
// ============================================

class DocumentProcessor {
  /**
   * 读取 docs/ 目录下所有文件
   */
  readDocuments(dir: string): Array<{ path: string; content: string }> {
    const files: Array<{ path: string; content: string }> = [];

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // 递归读取子目录
        files.push(...this.readDocuments(fullPath));
      } else if (entry.isFile()) {
        const ext = entry.name.toLowerCase();
        if (ext.endsWith('.md') || ext.endsWith('.txt')) {
          const content = readFileSync(fullPath, 'utf-8');
          files.push({
            path: fullPath.replace(process.cwd() + '/', ''),
            content,
          });
        }
      }
    }

    return files;
  }

  /**
   * 自动检测文档类别
   */
  detectCategory(content: string, filename: string): string {
    const lowerContent = content.toLowerCase();
    const lowerFilename = filename.toLowerCase();

    for (const [category, keywords] of Object.entries(CONFIG.categories)) {
      for (const keyword of keywords) {
        if (lowerFilename.includes(keyword) || lowerContent.includes(keyword)) {
          return category;
        }
      }
    }

    // 默认归为 strategy
    return 'strategy';
  }

  /**
   * 切分文档（按段落 + 字符数）
   */
  chunkDocument(content: string): string[] {
    // 先按段落切分
    const paragraphs = content.split(/\n\n+/);

    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;

      // 如果加上这段会超过 chunkSize，先保存当前块
      if (currentChunk.length + trimmed.length > CONFIG.chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        // 保留重叠部分
        const overlapText = currentChunk.slice(-CONFIG.chunkOverlap);
        currentChunk = overlapText + '\n\n' + trimmed;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
      }
    }

    // 添加最后一块
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * 处理所有文档
   */
  processDocuments(files: Array<{ path: string; content: string }>): DocumentChunk[] {
    const allChunks: DocumentChunk[] = [];

    for (const file of files) {
      console.log(`Processing: ${file.path}`);

      const chunks = this.chunkDocument(file.content);
      const category = this.detectCategory(file.content, file.path);

      chunks.forEach((chunk, index) => {
        allChunks.push({
          content: chunk,
          category,
          source: file.path,
          chunkIndex: index,
          metadata: {
            filename: file.path.split('/').pop(),
            chunk_count: chunks.length,
            char_count: chunk.length,
          },
        });
      });
    }

    return allChunks;
  }
}

// ============================================
// Supabase Client
// ============================================

function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// ============================================
// Main Ingestion Function
// ============================================

async function ingestDocuments() {
  console.log('🚀 Starting RAG knowledge base ingestion...\n');

  try {
    // 1. 读取文档
    console.log('📂 Reading documents from docs/');
    const processor = new DocumentProcessor();
    const files = processor.readDocuments(CONFIG.docsDir);

    if (files.length === 0) {
      console.warn('⚠️  No documents found in docs/ directory');
      console.log('💡 Tip: Create docs/ folder and add .md or .txt files');
      return;
    }

    console.log(`✅ Found ${files.length} documents\n`);

    // 2. 切分文档
    console.log('✂️  Chunking documents...');
    const chunks = processor.processDocuments(files);
    console.log(`✅ Created ${chunks.length} chunks\n`);

    // 3. 生成 embeddings
    console.log('🧠 Generating embeddings...');
    const embeddingService = new EmbeddingService();
    const texts = chunks.map(c => c.content);
    const embeddings = await embeddingService.generateBatchEmbeddings(texts);
    console.log('✅ Embeddings generated\n');

    // 4. 存入数据库
    console.log('💾 Storing in Supabase...');
    const supabase = createSupabaseClient();

    // 批量插入（每次100条）
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchEmbeddings = embeddings.slice(i, i + batchSize);

      const records = batch.map((chunk, idx) => ({
        content: chunk.content,
        embedding: JSON.stringify(`[${batchEmbeddings[idx].join(',')}]`), // pgvector format
        category: chunk.category,
        source: chunk.source,
        chunk_index: chunk.chunkIndex,
        metadata: chunk.metadata,
      }));

      const { error } = await supabase.from('knowledge_docs').insert(records);

      if (error) {
        console.error(`❌ Batch ${i / batchSize + 1} failed:`, error);
        throw error;
      }

      insertedCount += batch.length;
      console.log(`✅ Inserted ${Math.min(insertedCount, chunks.length)}/${chunks.length} chunks`);
    }

    console.log('\n✅ Ingestion completed successfully!');
    console.log(`📊 Total chunks inserted: ${insertedCount}`);

    // 5. 显示统计信息
    const { data: stats } = await supabase.rpc('get_knowledge_stats');
    if (stats) {
      console.log('\n📈 Knowledge base statistics:');
      console.table(stats);
    }

  } catch (error) {
    console.error('\n❌ Ingestion failed:', error);
    process.exit(1);
  }
}

// ============================================
// Execute
// ============================================

if (require.main === module) {
  ingestDocuments()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { ingestDocuments, DocumentProcessor, EmbeddingService };
