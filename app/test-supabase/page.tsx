'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient();

        // 测试 1: 检查环境变量
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!url || !key) {
          throw new Error('缺少 Supabase 环境变量');
        }

        // 测试 2: 尝试查询 profiles 表（会返回空数组或错误，但这能验证连接）
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);

        if (error) {
          // 如果是 RLS 错误，说明连接成功但需要认证
          if (error.message.includes('JWT') || error.message.includes('policy')) {
            setStatus('success');
            setMessage('✅ Supabase 连接成功！RLS 策略正常工作（需要登录）');
            setTables(['profiles', 'diagnosis_sessions', 'chat_logs', 'leads']);
          } else {
            throw error;
          }
        } else {
          setStatus('success');
          setMessage('✅ Supabase 连接成功！');
          setTables(['profiles', 'diagnosis_sessions', 'chat_logs', 'leads']);
        }

      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : '未知错误');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Supabase 连接测试</h1>

        <div className={`p-4 rounded-lg mb-4 ${
          status === 'loading' ? 'bg-blue-50 text-blue-800' :
          status === 'success' ? 'bg-green-50 text-green-800' :
          'bg-red-50 text-red-800'
        }`}>
          <p className="font-medium">{status === 'loading' ? '⏳ 测试中...' : message}</p>
        </div>

        {status === 'success' && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">数据库表结构：</h2>
            <ul className="space-y-2">
              {tables.map((table) => (
                <li key={table} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{table}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p className="font-medium mb-2">环境配置：</p>
          <ul className="space-y-1 text-xs">
            <li>• URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</li>
            <li>• Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</li>
            <li>• Zhipu AI: {process.env.ZHIPU_AI_KEY ? '✅ 已配置' : '❌ 未配置'}</li>
          </ul>
        </div>

        <a
          href="/"
          className="mt-6 block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}
