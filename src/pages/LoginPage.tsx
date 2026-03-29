/**
 * 登录/注册页面
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ArrowLeft, Loader2, Sparkles, Mail, Lock, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { signInWithEmail, signUpWithEmail, signInWithGitHub } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// 自定义动画
const customEasing = {
  unexpected: [0.87, 0, 0.13, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 如果已登录，重定向到首页
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = isLogin
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password, fullName);

    setLoading(false);

    if (result.success) {
      // 检查是否需要邮箱确认
      if (!isLogin && result.data?.needsEmailConfirmation) {
        toast.info('📧 注册成功！请检查你的邮箱并点击确认链接完成注册', {
          position: 'top-right',
          autoClose: 5000,
        });
        setError('');
        // 切换到登录模式
        setIsLogin(true);
        return;
      }

      if (!isLogin) {
        // 注册成功，显示成功提示
        toast.success('🎉 注册成功！欢迎加入万万没想到', {
          position: 'top-right',
          autoClose: 2000,
        });
      }
      // 登录成功的提示由useAuth hook处理，这里不重复显示

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }, isLogin ? 500 : 1500);
    } else {
      // 显示详细错误信息
      const errorMessage = result.error || '操作失败';

      // 根据错误类型提供更友好的提示
      if (errorMessage.includes('邮箱确认')) {
        setError(errorMessage);
        toast.info('📧 请检查你的邮箱并点击确认链接', {
          position: 'top-right',
          autoClose: 5000,
        });
      } else if (errorMessage.includes('已存在') || errorMessage.includes('already been registered')) {
        setError('该邮箱已注册，请直接登录');
        toast.info('💡 该邮箱已注册，请直接登录', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else if (errorMessage.includes('Invalid login credentials')) {
        setError('邮箱或密码错误');
        toast.error('❌ 邮箱或密码错误', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        setError(errorMessage);
        toast.error(`❌ ${errorMessage}`, {
          position: 'top-right',
          autoClose: 4000,
        });
      }
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError('');

    const result = await signInWithGitHub();
    setLoading(false);

    if (result.success) {
      // GitHub 登录成功的提示由useAuth hook处理，这里不重复显示
    } else {
      setError(result.error || 'GitHub 登录失败');
    }
    // GitHub 登录会重定向，不需要手动导航
  };

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-gray-900 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: customEasing.elastic }}
        className="w-full max-w-md relative z-10"
      >
        {/* 返回按钮 */}
        <motion.button
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回首页</span>
        </motion.button>

        <Card className="p-8 shadow-2xl border-2 border-purple-200 dark:border-purple-800 warm-glow">
          {/* Logo 和标题 */}
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: customEasing.unexpected }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl mb-6 overflow-hidden warm-glow"
            >
              <img src="/favicon.png" alt="Logo" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isLogin ? '欢迎回来' : '加入 Unexpectedly'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? '登录你的账户继续思考' : '创建账户开始你的思维之旅'}
            </p>
          </motion.div>

          {/* 错误提示 */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl"
              >
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ ease: customEasing.unexpected }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    姓名（可选）
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                      placeholder="你的名字"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                fullWidth
                isLoading={loading}
                disabled={loading}
                className="py-4 text-lg rounded-2xl shadow-lg"
              >
                {loading ? '处理中...' : isLogin ? '登录' : '注册'}
              </Button>
            </motion.div>
          </form>

          {/* 分隔线 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 font-medium">
                或
              </span>
            </div>
          </div>

          {/* GitHub 登录 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mb-6"
          >
            <Button
              onClick={handleGitHubLogin}
              variant="outline"
              fullWidth
              disabled={loading}
              className="py-4 border-2 hover:border-gray-300 dark:hover:border-gray-600 rounded-2xl transition-all"
            >
              <Github size={22} className="mr-2" />
              使用 GitHub 继续
            </Button>
          </motion.div>

          {/* 切换登录/注册 */}
            <motion.div
              key={isLogin ? 'to-register' : 'to-login'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-gray-600 dark:text-gray-400"
            >
              {isLogin ? '还没有账户？' : '已有账户？'}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold underline underline-offset-4"
              >
                {isLogin ? '立即注册' : '立即登录'}
              </motion.button>
            </motion.div>
        </Card>

        {/* 提示信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="inline-block px-6 py-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              登录即表示你同意我们的
            </p>
            <div className="flex justify-center gap-2 text-sm">
              <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                服务条款
              </a>
              <span className="text-gray-400">和</span>
              <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                隐私政策
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
