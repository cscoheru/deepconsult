/**
 * Supabase Server Client Configuration
 * 服务端 Supabase 实例（用于 Server Actions 和 API Routes）
 * 使用 @supabase/ssr 替代已废弃的 auth-helpers
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database'; // 将在下一步生成

export const createServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
};

/**
 * 便捷函数：服务端获取当前用户
 */
export async function getCurrentUserServer() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * 便捷函数：服务端获取当前用户的 Profile
 */
export async function getCurrentUserProfileServer() {
  const supabase = await createServerClient();
  const user = await getCurrentUserServer();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
}
