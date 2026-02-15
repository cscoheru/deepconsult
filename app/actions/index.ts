/**
 * Chat Actions Export
 * 统一导出所有对话相关 Server Actions
 */

export {
  streamChat,
  extractInsights,
  getChatHistory,
  triggerExtraction,
  completeCurrentStage,
} from './chat';

export type {
  StreamChatOptions,
  ExtractedInsights,
} from './chat';
