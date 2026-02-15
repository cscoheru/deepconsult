/**
 * Chat Messages Server Actions
 * 用于管理聊天消息的 Server Actions
 */

'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { ChatLog, ChatLogInsert } from '@/types/supabase';

/**
 * 添加聊天消息
 */
export async function addChatMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, any>
) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  // 验证会话属于当前用户
  const { data: session, error: sessionError } = await supabase
    .from('diagnosis_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    return { data: null, error: new Error('Session not found or access denied') };
  }

  const newMessage: ChatLogInsert = {
    session_id: sessionId,
    role,
    content,
    metadata: metadata || {},
  };

  return await supabase
    .from('chat_logs')
    .insert(newMessage)
    .select()
    .single();
}

/**
 * 获取会话的所有聊天消息
 */
export async function getChatMessages(sessionId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('chat_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
}

/**
 * 获取会话的最新 N 条消息
 */
export async function getRecentChatMessages(sessionId: string, limit: number = 10) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('chat_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);
}

/**
 * 删除单条聊天消息
 */
export async function deleteChatMessage(messageId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  // 先获取消息所属的会话，验证权限
  const { data: message } = await supabase
    .from('chat_logs')
    .select('session_id')
    .eq('id', messageId)
    .single();

  if (!message) {
    return { data: null, error: new Error('Message not found') };
  }

  // 验证会话属于当前用户
  const { data: session } = await supabase
    .from('diagnosis_sessions')
    .select('id')
    .eq('id', message.session_id)
    .eq('user_id', user.id)
    .single();

  if (!session) {
    return { data: null, error: new Error('Access denied') };
  }

  // 删除消息
  return await supabase
    .from('chat_logs')
    .delete()
    .eq('id', messageId);
}

/**
 * 批量添加聊天消息（用于导入或同步）
 */
export async function batchAddChatMessages(messages: Array<{
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
}>) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const messagesToInsert: ChatLogInsert[] = messages.map(msg => ({
    session_id: msg.sessionId,
    role: msg.role,
    content: msg.content,
    metadata: msg.metadata || {},
  }));

  return await supabase
    .from('chat_logs')
    .insert(messagesToInsert)
    .select();
}
