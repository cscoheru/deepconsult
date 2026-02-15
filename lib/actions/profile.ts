/**
 * Profile Server Actions
 * 用于管理用户档案的 Server Actions
 */

'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { Profile, ProfileInsert } from '@/types/supabase';

/**
 * 获取当前用户的 Profile
 */
export async function getCurrentUserProfile() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
}

/**
 * 更新用户 Profile
 */
export async function updateUserProfile(updates: Partial<ProfileInsert>) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();
}

/**
 * 更新用户公司信息
 */
export async function updateCompanyInfo(data: {
  company_name: string;
  industry: string;
  employee_count: string;
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('profiles')
    .update({
      company_name: data.company_name,
      industry: data.industry,
      employee_count: data.employee_count,
    })
    .eq('id', user.id)
    .select()
    .single();
}

/**
 * 检查用户是否已完成个人资料设置
 */
export async function checkProfileCompleteness() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { data: null, error: new Error('Profile not found') };
  }

  const requiredFields = [
    'full_name',
    'company_name',
    'industry',
    'employee_count'
  ] as const;

  const missingFields = requiredFields.filter(
    field => !profile[field]
  );

  return {
    data: {
      isComplete: missingFields.length === 0,
      missingFields,
      completionPercentage: Math.round(
        ((requiredFields.length - missingFields.length) / requiredFields.length) * 100
      ),
    },
    error: null,
  };
}

/**
 * 删除用户账户（级联删除所有数据）
 */
export async function deleteUserAccount() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  // 先删除 profile（会级联删除 diagnosis_sessions, chat_logs 等）
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id);

  if (profileError) {
    return { data: null, error: profileError };
  }

  // 最后删除 auth 用户
  const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

  if (authError) {
    return { data: null, error: authError };
  }

  return { data: { success: true }, error: null };
}
