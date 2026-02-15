/**
 * Diagnosis Session Server Actions
 * 用于管理诊断会话的 Server Actions
 */

'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { DiagnosisSession, DiagnosisSessionInsert } from '@/types/supabase';

/**
 * 创建新的诊断会话
 */
export async function createDiagnosisSession() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const newSession: DiagnosisSessionInsert = {
    user_id: user.id,
    status: 'active',
    current_stage: 'strategy',
    data_strategy: {},
    data_structure: {},
    data_performance: {},
    data_compensation: {},
    data_talent: {},
    total_score: 0,
    summary_report: null,
  };

  return await supabase
    .from('diagnosis_sessions')
    .insert(newSession)
    .select()
    .single();
}

/**
 * 获取用户的所有诊断会话
 */
export async function getUserDiagnosisSessions() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('diagnosis_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
}

/**
 * 获取单个诊断会话（包含聊天记录）
 */
export async function getDiagnosisSessionWithMessages(sessionId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  // 获取会话信息
  const { data: session, error: sessionError } = await supabase
    .from('diagnosis_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError) {
    return { data: null, error: sessionError };
  }

  // 获取聊天记录
  const { data: messages, error: messagesError } = await supabase
    .from('chat_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    return { data: null, error: messagesError };
  }

  return {
    data: {
      session,
      messages: messages || [],
    },
    error: null,
  };
}

/**
 * 更新诊断会话的当前阶段
 */
export async function updateSessionStage(sessionId: string, stage: 'strategy' | 'structure' | 'performance' | 'compensation' | 'talent') {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('diagnosis_sessions')
    .update({ current_stage: stage })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select()
    .single();
}

/**
 * 更新会话的维度数据
 */
export async function updateDimensionData(
  sessionId: string,
  dimension: 'strategy' | 'structure' | 'performance' | 'compensation' | 'talent',
  data: any
) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const fieldName = `data_${dimension}` as const;

  return await supabase
    .from('diagnosis_sessions')
    .update({ [fieldName]: data })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select()
    .single();
}

/**
 * 完成诊断会话并生成总结报告
 */
export async function completeDiagnosisSession(sessionId: string, summaryReport: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  // 计算总分（如果尚未计算）
  const { data: session } = await supabase
    .from('diagnosis_sessions')
    .select('data_strategy, data_structure, data_performance, data_compensation, data_talent')
    .eq('id', sessionId)
    .single();

  if (!session) {
    return { data: null, error: new Error('Session not found') };
  }

  const calculateScore = (data: any) => data?.score || 0;
  const totalScore = Math.round(
    (calculateScore(session.data_strategy) +
     calculateScore(session.data_structure) +
     calculateScore(session.data_performance) +
     calculateScore(session.data_compensation) +
     calculateScore(session.data_talent)) / 5
  );

  return await supabase
    .from('diagnosis_sessions')
    .update({
      status: 'completed',
      summary_report: summaryReport,
      total_score: totalScore,
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select()
    .single();
}

/**
 * 删除诊断会话（级联删除相关聊天记录）
 */
export async function deleteDiagnosisSession(sessionId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('diagnosis_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id);
}
