/**
 * Zhipu AI Client
 * 智谱 AI API 封装
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// 类型定义
// ============================================

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface StreamChatOptions {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================
// Zhipu AI Client
// ============================================

export class ZhipuAIClient {
  private apiKey: string;
  private baseURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ZHIPU_AI_KEY || '';
    if (!this.apiKey) {
      throw new Error('ZHIPU_AI_KEY is not configured');
    }
  }

  /**
   * 生成 JWT Token (智谱 API 要求)
   */
  private generateToken(): string {
    // 注意：实际生产环境应该使用服务端生成 JWT
    // 这里简化为直接使用 API Key
    // 如果需要，可以使用 jsonwebtoken 库生成
    return this.apiKey;
  }

  /**
   * 非流式对话
   */
  async chat(
    messages: ChatMessage[],
    options: StreamChatOptions = {}
  ): Promise<ChatCompletionResponse> {
    const {
      temperature = 0.7,
      topP = 0.9,
      maxTokens = 2000,
    } = options;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.generateToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'glm-4-flash', // 使用快速模型
          messages,
          temperature,
          top_p: topP,
          max_tokens: maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Zhipu API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data as ChatCompletionResponse;
    } catch (error) {
      console.error('Zhipu AI chat error:', error);
      throw error;
    }
  }

  /**
   * 流式对话（用于 Server Action）
   */
  async *streamChat(
    messages: ChatMessage[],
    options: StreamChatOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const {
      temperature = 0.7,
      topP = 0.9,
      maxTokens = 2000,
    } = options;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.generateToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages,
          temperature,
          top_p: topP,
          max_tokens: maxTokens,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Zhipu API error: ${response.status} - ${errorText}`);
      }

      // 读取流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // 忽略解析错误
            console.warn('Failed to parse SSE data:', data);
          }
        }
      }
    } catch (error) {
      console.error('Zhipu AI stream chat error:', error);
      throw error;
    }
  }

  /**
   * 提取结构化数据（JSON 模式）
   */
  async extractJSON<T = any>(
    messages: ChatMessage[],
    options: StreamChatOptions = {}
  ): Promise<T> {
    const response = await this.chat(messages, {
      ...options,
      temperature: 0.3, // 降低温度以获得更确定性的 JSON
    });

    const content = response.choices[0]?.message?.content || '{}';

    try {
      // 尝试提取 JSON（可能被包裹在 markdown 代码块中）
      let jsonStr = content;

      // 移除 markdown 代码块标记
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // 解析 JSON
      const parsed = JSON.parse(jsonStr);
      return parsed as T;
    } catch (error) {
      console.error('Failed to parse JSON from AI response:', content);
      // 返回一个默认的结构
      return {
        score: 0,
        tags: [],
        key_issues: [],
        error: 'Failed to parse AI response',
      } as T;
    }
  }
}

// ============================================
// 便捷函数
// ============================================

/**
 * 创建 Zhipu AI Client 实例
 */
export function createAIClient(): ZhipuAIClient {
  return new ZhipuAIClient();
}

/**
 * 简单的对话函数（非流式）
 */
export async function chatWithAI(
  userMessage: string,
  systemPrompt?: string
): Promise<string> {
  const client = createAIClient();

  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: userMessage });

  const response = await client.chat(messages);
  return response.choices[0]?.message?.content || '';
}

/**
 * 流式对话函数（用于 Server Actions）
 */
export async function* streamChatWithAI(
  userMessage: string,
  systemPrompt?: string,
  options?: StreamChatOptions
): AsyncGenerator<string> {
  const client = createAIClient();

  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: userMessage });

  yield* client.streamChat(messages, options);
}

/**
 * 提取 JSON 结构化数据
 */
export async function extractJSONWithAI<T = any>(
  userMessage: string,
  systemPrompt: string,
  options?: StreamChatOptions
): Promise<T> {
  const client = createAIClient();

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  return await client.extractJSON<T>(messages, options);
}
