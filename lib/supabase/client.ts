/**
 * Supabase Client Configuration
 * 客户端 Supabase 实例（用于浏览器环境）
 * 使用 @supabase/ssr 替代已废弃的 auth-helpers
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database'; // 将在下一步生成

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const createClient = () => {
  if (client) return client;

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
};

/**
 * 便捷函数：获取当前用户
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * 便捷函数：获取当前用户的 Profile
 */
export async function getCurrentUserProfile() {
  const supabase = createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
}
