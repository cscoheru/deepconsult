/**
 * Supabase Database Type Definitions
 * Generated from migration: 001_initial_schema.sql
 */

// ============================================
// ENUMS
// ============================================
export type SessionStatus = 'active' | 'completed' | 'archived';
export type ChatRole = 'user' | 'assistant' | 'system';
export type LeadStatus = 'new' | 'contacted' | 'converted';

// ============================================
// PROFILES
// ============================================
export interface Profile {
  id: string; // UUID
  full_name: string | null;
  company_name: string | null;
  job_title: string | null;
  industry: string | null;
  employee_count: string | null; // '1-50' | '51-200' | '201-500' | '500+'
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface ProfileInsert extends Omit<Profile, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

// ============================================
// DIAGNOSIS SESSIONS
// ============================================

// 五维数据结构 (示例，可根据实际需求扩展)
export interface DimensionData {
  score?: number; // 维度得分 (0-100)
  labels?: string[]; // AI提取的标签
  summary?: string; // 维度摘要
  details?: Record<string, any>; // 其他详细信息
}

export interface DiagnosisSession {
  id: string; // UUID
  user_id: string; // UUID -> profiles.id
  status: SessionStatus;
  current_stage: 'strategy' | 'structure' | 'performance' | 'compensation' | 'talent';

  // 五维数据字段 (JSONB)
  data_strategy: Record<string, any>; // DimensionData
  data_structure: Record<string, any>;
  data_performance: Record<string, any>;
  data_compensation: Record<string, any>;
  data_talent: Record<string, any>;

  total_score: number;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface DiagnosisSessionInsert extends Omit<DiagnosisSession, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

// ============================================
// CHAT LOGS
// ============================================
export interface ChatLog {
  id: string; // UUID
  session_id: string; // UUID -> diagnosis_sessions.id
  role: ChatRole;
  content: string;
  metadata: {
    tokens?: number;
    model?: string;
    reasoning?: string; // AI思考过程
    cost?: number;
    [key: string]: any;
  };
  created_at: string; // TIMESTAMPTZ
}

export interface ChatLogInsert extends Omit<ChatLog, 'id' | 'created_at'> {
  id?: string;
}

// ============================================
// LEADS
// ============================================
export interface Lead {
  id: string; // UUID
  user_id: string; // UUID -> profiles.id
  lead_score: number; // 0-100
  status: LeadStatus;
  notes: string | null;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface LeadInsert extends Omit<Lead, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

// ============================================
// JOIN TYPES (常用查询结果)
// ============================================
export interface SessionWithProfile extends DiagnosisSession {
  profile: Profile;
}

export interface ChatLogWithSession extends ChatLog {
  session: DiagnosisSession;
}

export interface LeadWithProfile extends Lead {
  profile: Profile;
}

// ============================================
// DATABASE RESPONSES (Supabase格式)
// ============================================
export type DatabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

export type DatabaseResponseArray<T> = {
  data: T[] | null;
  error: Error | null;
};

// ============================================
// ROW LEVEL SECURITY HELPERS
// ============================================
export interface RLSPolicy {
  table: 'profiles' | 'diagnosis_sessions' | 'chat_logs' | 'leads';
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  using?: string; // SQL condition
  with_check?: string; // SQL condition
}

// ============================================
// REALTIME SUBSCRIPTION TYPES
// ============================================
export type RealtimeChannel =
  | 'profiles'
  | 'diagnosis_sessions'
  | 'chat_logs'
  | 'leads';

export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  old: T | null;
  new: T | null;
  errors: string[] | null;
}
