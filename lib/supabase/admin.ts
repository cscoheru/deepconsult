/**
 * Supabase Admin Client Configuration
 * 服务端 Admin 实例（绕过 RLS，仅用于服务端特殊操作）
 * ⚠️ 警告：此客户端拥有完全权限，请勿在客户端代码中使用
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database'; // 将在下一步生成

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * 便捷函数：创建 Lead（由服务端调用，不受 RLS 限制）
 */
export async function createLead(userId: string, leadScore: number = 50) {
  return await supabaseAdmin
    .from('leads')
    .insert({
      user_id: userId,
      lead_score: leadScore,
      status: 'new',
    })
    .select()
    .single();
}

/**
 * 便捷函数：更新 Lead 状态
 */
export async function updateLeadStatus(
  leadId: string,
  status: 'new' | 'contacted' | 'converted'
) {
  return await supabaseAdmin
    .from('leads')
    .update({ status })
    .eq('id', leadId)
    .select()
    .single();
}
