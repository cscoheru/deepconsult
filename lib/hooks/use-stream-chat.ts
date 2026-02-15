/**
 * useStreamChat Hook
 * 用于处理流式 AI 对话的前端 Hook
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { streamChat } from '@/app/actions';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UseStreamChatOptions {
  sessionId: string;
  onMessageComplete?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export function useStreamChat({
  sessionId,
  onMessageComplete,
  onError,
}: UseStreamChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAIResponse, setCurrentAIResponse] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 发送消息并接收流式回复
   */
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isStreaming) return;

    // 1. 添加用户消息到列表
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    setCurrentAIResponse('');

    // 2. 创建 AI 消息占位符
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMsg]);

    try {
      // 3. 调用 Server Action（流式）
      const streamGenerator = await streamChat({
        sessionId,
        message: userMessage,
      });

      // 4. 逐块接收并更新
      let fullResponse = '';

      for await (const chunk of streamGenerator) {
        fullResponse += chunk;
        setCurrentAIResponse(fullResponse);

        // 实时更新消息内容
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMsgId
              ? { ...msg, content: fullResponse }
              : msg
          )
        );
      }

      // 5. 完成
      setCurrentAIResponse('');
      setIsStreaming(false);

      const completedMsg: Message = {
        id: aiMsgId,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      };

      onMessageComplete?.(completedMsg);

    } catch (error) {
      console.error('Chat error:', error);
      setIsStreaming(false);
      setCurrentAIResponse('');

      // 移除失败的 AI 消息
      setMessages(prev => prev.filter(msg => msg.id !== aiMsgId));

      onError?.(error as Error);
    }
  }, [sessionId, isStreaming, onMessageComplete, onError]);

  /**
   * 停止当前流式输出
   */
  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setCurrentAIResponse('');
  }, []);

  /**
   * 清空消息历史
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentAIResponse('');
  }, []);

  /**
   * 手动添加消息（用于从数据库加载历史）
   */
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  /**
   * 批量加载消息（用于初始化）
   */
  const setMessagesList = useCallback((messageList: Message[]) => {
    setMessages(messageList);
  }, []);

  return {
    messages,
    isStreaming,
    currentAIResponse,
    sendMessage,
    stopStreaming,
    clearMessages,
    addMessage,
    setMessagesList,
  };
}
