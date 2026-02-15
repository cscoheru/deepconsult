/**
 * Chat Server Actions
 * AI 对话和数据提取 Server Actions
 */

'use server';

import { createServerClient } from '@/lib/supabase/server';
import {
  streamChatWithAI,
  extractJSONWithAI,
  ChatMessage,
} from '@/lib/ai/zhipu';
import {
  retrieveDocumentsAsContext,
  DocumentMatch,
} from '@/lib/rag/retrieve';
import type { DiagnosisSession, ChatLog } from '@/types/supabase';

// ============================================
// 类型定义
// ============================================

export interface StreamChatOptions {
  sessionId: string;
  message: string;
  temperature?: number;
}

export interface ExtractedInsights {
  score: number; // 0-100
  tags: string[];
  key_issues: string[];
  summary?: string;
  recommendations?: string[];
}

// ============================================
// 1. 前台对话 Action (流式输出)
// ============================================

/**
 * 流式对话 Server Action
 *
 * 功能：
 * 1. 检索 RAG 知识库
 * 2. 组装 Prompt（含上下文和诊断进度）
 * 3. 调用 AI 生成回复（流式）
 * 4. 保存对话到数据库
 *
 * 使用方式（前端）：
 * ```typescript
 * const stream = await streamChat({ sessionId: 'xxx', message: '用户问题' });
 *
 * for await (const chunk of stream) {
 *   appendToChat(chunk);
 * }
 * ```
 */
export async function streamChat(
  options: StreamChatOptions
): Promise<AsyncGenerator<string, void, unknown>> {
  const { sessionId, message, temperature = 0.7 } = options;

  try {
    // 1. 获取会话信息
    const supabase = await createServerClient();
    const { data: session, error: sessionError } = await supabase
      .from('diagnosis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // 2. 检索相关知识库
    const context = await retrieveDocumentsAsContext(message, {
      category: session.current_stage as any,
      threshold: 0.7,
      topK: 3,
    });

    // 3. 组装 System Prompt
    const systemPrompt = buildSystemPrompt(session.current_stage, context);

    // 4. 保存用户消息
    await supabase.from('chat_logs').insert({
      session_id: sessionId,
      role: 'user',
      content: message,
      metadata: {
        stage: session.current_stage,
        timestamp: new Date().toISOString(),
      },
    });

    // 5. 调用 AI（流式）并保存 AI 回复
    let fullAIResponse = '';

    // 创建异步生成器
    async function* generateStream(): AsyncGenerator<string, void, unknown> {
      try {
        const aiStream = streamChatWithAI(message, systemPrompt, { temperature });

        for await (const chunk of aiStream) {
          fullAIResponse += chunk;
          yield chunk;
        }

        // 保存完整的 AI 回复
        await supabase.from('chat_logs').insert({
          session_id: sessionId,
          role: 'assistant',
          content: fullAIResponse,
          metadata: {
            stage: session.current_stage,
            timestamp: new Date().toISOString(),
            rag_context_used: true,
          },
        });

        // 6. 异步触发数据提取（不阻塞对话流）
        extractInsights(sessionId).catch(error => {
          console.error('Background extraction failed:', error);
        });

      } catch (error) {
        console.error('Stream generation error:', error);
        throw error;
      }
    }

    return generateStream();

  } catch (error) {
    console.error('streamChat error:', error);
    throw error;
  }
}

/**
 * 构建 System Prompt
 */
function buildSystemPrompt(
  currentStage: string,
  ragContext: string
): string {
  const stageNames: Record<string, string> = {
    strategy: '战略',
    structure: '组织结构',
    performance: '绩效管理',
    compensation: '薪酬激励',
    talent: '人才发展',
  };

  const stageName = stageNames[currentStage] || currentStage;

  return `你是一位资深的组织管理咨询专家，专注于${stageName}领域。

你的任务是基于以下专业知识库内容，为用户提供精准、实用的咨询建议。

## 参考资料（来自知识库）

${ragContext}

## 当前诊断进度

当前正在评估：${stageName}维度

## 对话原则

1. **专业深度**: 展现对${stageName}的深刻理解
2. **实用导向**: 提供可落地的具体建议
3. **循证依据**: 基于知识库内容，引用最佳实践
4. **互动引导**: 通过提问深入了解用户情况
5. **结构化输出**: 使用分点、列表等清晰的结构

## 回答格式

- 开头：直接回应用户问题
- 主体：提供 2-4 个关键点
- 结尾：提出后续问题，引导对话深入

## 注意事项

- 如果知识库内容不够充分，可以基于通用管理知识补充
- 适时使用"根据您的描述..."、"从咨询经验来看..."等表达
- 避免过于理论化，多举实际案例`;
}

// ============================================
// 2. 后台提取 Action (异步调用)
// ============================================

/**
 * 提取结构化洞察（后台异步执行）
 *
 * 功能：
 * 1. 获取对话历史
 * 2. 调用 AI 提取结构化数据（JSON）
 * 3. 更新 diagnosis_sessions 的 data_{module} 字段
 *
 * 注意：此函数设计为后台异步执行，失败不影响主对话流
 */
export async function extractInsights(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. 获取会话信息和对话历史
    const supabase = await createServerClient();
    const { data: session, error: sessionError } = await supabase
      .from('diagnosis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return { success: false, error: 'Session not found' };
    }

    const { data: messages, error: messagesError } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError || !messages) {
      return { success: false, error: 'Failed to fetch messages' };
    }

    // 2. 组装对话历史
    const conversation = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    // 3. 构建 System Prompt（提取模式）
    const currentStage = session.current_stage;
    const stageNames: Record<string, string> = {
      strategy: '战略',
      structure: '组织结构',
      performance: '绩效管理',
      compensation: '薪酬激励',
      talent: '人才发展',
    };
    const stageName = stageNames[currentStage] || currentStage;

    const systemPrompt = `你是一位组织管理数据分析专家。你的任务是从对话中提取结构化数据。

## 当前分析维度：${stageName}

## 任务说明

请分析以下对话记录，提取关于"${stageName}"的结构化洞察。

## 输出格式（严格遵循JSON）

请输出以下JSON格式（不要包含其他文字）：

\`\`\`json
{
  "score": <数字 0-100>,
  "tags": ["标签1", "标签2", "标签3"],
  "key_issues": ["问题1", "问题2"],
  "summary": "<简短总结>",
  "recommendations": ["建议1", "建议2"]
}
\`\`\`

## 评分标准

- **score (0-100)**:
  - 90-100: 优秀（行业领先水平）
  - 70-89: 良好（高于平均水平）
  - 50-69: 一般（符合基本标准）
  - 30-49: 较差（存在明显问题）
  - 0-29: 严重（亟需改进）

- **tags**: 提取 3-5 个关键词或标签
- **key_issues**: 列出 2-4 个关键问题
- **summary**: 用一句话概括现状（50字以内）
- **recommendations**: 提出 2-3 个改进建议

## 注意事项

1. 严格输出 JSON 格式，不要包含任何解释性文字
2. 如果对话信息不足，给出保守估计
3. 评分要有依据，体现专业判断
4. 标签和问题要具体，避免空泛`;

    // 4. 调用 AI 提取 JSON
    const insights = await extractJSONWithAI<ExtractedInsights>(
      conversation,
      systemPrompt,
      { temperature: 0.3 }
    );

    // 5. 验证提取的数据
    if (!insights || typeof insights.score !== 'number') {
      console.error('Invalid insights extracted:', insights);
      return { success: false, error: 'Invalid extraction format' };
    }

    // 6. 更新数据库
    const fieldName = `data_${currentStage}` as const;
    const updateData = {
      [fieldName]: insights,
    };

    const { error: updateError } = await supabase
      .from('diagnosis_sessions')
      .update(updateData)
      .eq('id', sessionId);

    if (updateError) {
      console.error('Failed to update session:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log(`✅ Successfully extracted insights for ${currentStage}:`, insights);
    return { success: true };

  } catch (error) {
    console.error('extractInsights error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// 3. 辅助函数
// ============================================

/**
 * 获取会话的完整对话历史
 */
export async function getChatHistory(sessionId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('chat_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * 手动触发数据提取（用于测试或按需提取）
 */
export async function triggerExtraction(
  sessionId: string
): Promise<{ success: boolean; insights?: ExtractedInsights; error?: string }> {
  try {
    // 先调用提取
    const result = await extractInsights(sessionId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // 获取更新后的会话数据
    const supabase = await createServerClient();
    const { data: session } = await supabase
      .from('diagnosis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    // 提取当前阶段的数据
    const currentStage = session?.current_stage;
    const fieldName = `data_${currentStage}` as const;
    const insights = session?.[fieldName];

    return { success: true, insights: insights as ExtractedInsights };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 完成当前阶段并进入下一阶段
 */
export async function completeCurrentStage(sessionId: string) {
  try {
    const supabase = await createServerClient();
    const { data: session } = await supabase
      .from('diagnosis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    // 阶段顺序
    const stages = ['strategy', 'structure', 'performance', 'compensation', 'talent'] as const;
    const currentIndex = stages.indexOf(session.current_stage as any);

    if (currentIndex === -1 || currentIndex === stages.length - 1) {
      // 已经是最后阶段或无效阶段
      return { success: false, error: 'No next stage' };
    }

    const nextStage = stages[currentIndex + 1];

    // 更新到下一阶段
    const { error } = await supabase
      .from('diagnosis_sessions')
      .update({ current_stage: nextStage })
      .eq('id', sessionId);

    if (error) {
      throw error;
    }

    return { success: true, nextStage };

  } catch (error) {
    console.error('completeCurrentStage error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
