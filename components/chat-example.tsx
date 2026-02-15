/**
 * Chat Interface Example
 * 展示如何使用 useStreamChat Hook
 */

'use client';

import { useState } from 'react';
import { useStreamChat } from '@/lib/hooks/use-stream-chat';
import { Send, Loader2 } from 'lucide-react';

export function ChatInterface({ sessionId }: { sessionId: string }) {
  const [input, setInput] = useState('');

  const {
    messages,
    isStreaming,
    currentAIResponse,
    sendMessage,
    stopStreaming,
  } = useStreamChat({
    sessionId,
    onMessageComplete: (msg) => {
      console.log('Message completed:', msg);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      alert(`对话出错: ${error.message}`);
    },
  });

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input;
    setInput('');

    try {
      await sendMessage(userMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>开始对话...</p>
            <p className="text-sm mt-2">我将基于专业知识为您提供咨询建议</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-secondary text-secondary-foreground rounded-tl-sm'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
              <span className="text-xs opacity-60 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {/* 当前流式输出 */}
        {isStreaming && currentAIResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary text-secondary-foreground px-4 py-2.5">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {currentAIResponse}
                <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
              </p>
            </div>
          </div>
        )}

        {/* 加载指示器 */}
        {isStreaming && !currentAIResponse && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="输入您的问题... (Enter 发送，Shift+Enter 换行)"
            className="flex-1 min-h-[60px] max-h-[200px] px-4 py-3 rounded-xl border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isStreaming}
          />

          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="px-4 py-3 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
            >
              停止
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
