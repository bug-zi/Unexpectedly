/**
 * 认证回调页面（用于 OAuth 重定向）
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 处理 OAuth 回调
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {
          // 登录成功，重定向到首页或原访问页面
          const from = (window.history.state as any)?.usr?.pathname || '/';
          navigate(from, { replace: true });
        } else {
          // 没有会话，重定向到登录页
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('认证回调处理失败:', error);
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={48} className="animate-spin text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">正在处理登录...</p>
      </div>
    </div>
  );
}
