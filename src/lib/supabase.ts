/**
 * Supabase 客户端配置
 * 使用单例模式，避免重复初始化导致的 Navigator Lock 竞争
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // 使用 implicit 流程而不是 PKCE，避免注册时的复杂流程
    flowType: 'implicit',
    storage: window.localStorage,
    storageKey: 'sb-qfeajzwaliulepahckdx-auth-token',
  },
  // 添加全局错误处理
  global: {
    headers: {
      'X-Client-Info': 'wanwan-xiangdao',
    },
  },
  // 启用数据库查询缓存，减少重复请求
  db: {
    schema: 'public',
  },
});
