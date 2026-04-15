/**
 * 用户个人资料页面
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSync } from '@/hooks/useSync';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  User,
  Settings,
  Download,
  Upload,
  Trash2,
  TrendingUp,
  Camera,
  Edit2,
  X,
  Check,
  Brain,
  PenTool,
  Lightbulb,
  Bot,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Send,
  HelpCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SyncStatusIndicator } from '@/components/ui/SyncStatusIndicator';
import {
  exportDataAsJSON,
  importDataFromJSON,
  clearAllData,
  getAnswers,
  getTurtleSoupRecords,
  getRiddleRecords,
  getYesOrNoRecords,
  getGuessNumberRecords,
} from '@/utils/storage';
import { getSlotMachineResults } from '@/utils/storage';
import { getUserDataSync, getCurrentUserId } from '@/utils/userStorage';
import { manualSync, checkUnsyncedData, getLocalDataStats } from '@/services/syncService';
import { toast } from 'react-toastify';
import { getProviderConfig, validateApiKey } from '@/services/llmService';
import { useRoundtableStore } from '@/stores/roundtableStore';
import type { LLMProvider } from '@/types';
import { submitFeedback, checkRateLimit } from '@/services/feedbackService';
import { usePageSEO } from '@/hooks/usePageSEO';

interface CheckInRecord {
  date: string;
  timestamp: number;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { signOut: authSignOut, user, profile: authProfile, isAuthenticated, loading: authLoading } = useAuth();

  // 用于编辑的本地 profile 状态，从 useAuth 同步
  const [profile, setProfile] = useState<any>(null);

  // 同步 authProfile 到本地 profile
  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile);
    }
  }, [authProfile]);

  // 如果 authProfile 为空但用户已登录，尝试从数据库加载
  useEffect(() => {
    const loadProfileFromDB = async () => {
      // 只在以下情况执行：
      // 1. 认证加载完成
      // 2. 用户已登录
      // 3. authProfile 为空
      // 4. 本地 profile 也为空
      if (authLoading || !user || authProfile || profile) return;

      console.log('🔄 ProfilePage: 尝试从数据库加载 profile');
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('加载 profile 失败:', error);
          return;
        }

        if (data) {
          console.log('✅ ProfilePage: 从数据库加载 profile 成功');
          setProfile(data);
        }
      } catch (err) {
        console.error('加载 profile 出错:', err);
      }
    };

    loadProfileFromDB();
  }, [authLoading, user, authProfile, profile]);

  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    gender: '',
    age: '',
    bio: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  const [stats, setStats] = useState({
    totalAnswers: 0,
    totalCheckIns: 0,
  });

  // 思考记录统计
  const [thinkingStats, setThinkingStats] = useState({
    logicReasoning: 0,
    questionThinking: 0,
    writingCreation: 0,
  });

  // 本地数据状态
  const [hasUnsyncedData, setHasUnsyncedData] = useState(false);
  const [localDataCount, setLocalDataCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // 孤儿数据检测：游客模式下 localStorage 中有之前登录用户的数据
  const [orphanDataInfo, setOrphanDataInfo] = useState<{ found: boolean; userId: string; dataCount: number } | null>(null);

  // 云端同步状态
  const { syncStatus, lastSync, manualSync: oldManualSync } = useSync(true);

  // AI 配置状态
  const { llmConfig, setLLMConfig, clearLLMConfig } = useRoundtableStore();
  const [aiProvider, setAiProvider] = useState<LLMProvider>('deepseek');
  const [apiKey, setApiKey] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [aiBaseUrl, setAiBaseUrl] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationMessage, setValidationMessage] = useState('');

  // 反馈相关状态
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  // 从 store 加载已有配置
  useEffect(() => {
    if (llmConfig) {
      setAiProvider(llmConfig.provider);
      setApiKey(llmConfig.apiKey);
      setAiModel(llmConfig.model);
      if (llmConfig.baseUrl) setAiBaseUrl(llmConfig.baseUrl);
    }
  }, [llmConfig]);

  // provider 变化时重置 model 和 baseUrl
  useEffect(() => {
    const config = getProviderConfig(aiProvider);
    setAiModel(config.defaultModel);
    setAiBaseUrl('');
    setShowAdvanced(false);
  }, [aiProvider]);

  // AI 配置保存
  const handleSaveAIConfig = () => {
    if (!apiKey.trim()) {
      toast.error('请输入 API Key');
      return;
    }
    const newConfig = {
      provider: aiProvider,
      apiKey: apiKey.trim(),
      model: aiModel,
      baseUrl: aiBaseUrl.trim() || undefined,
    };
    setLLMConfig(newConfig);
    toast.success('AI 配置已保存');
    setValidationStatus('idle');
  };

  // AI 连接测试
  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast.error('请先输入 API Key');
      return;
    }
    setIsValidating(true);
    setValidationStatus('idle');
    setValidationMessage('');
    try {
      const config = {
        provider: aiProvider,
        apiKey: apiKey.trim(),
        model: aiModel,
        baseUrl: aiBaseUrl.trim() || undefined,
      };
      const isValid = await validateApiKey(config);
      if (isValid) {
        setValidationStatus('success');
        setValidationMessage('连接成功！API Key 有效');
      } else {
        setValidationStatus('error');
        setValidationMessage('连接失败，请检查 API Key 和网络');
      }
    } catch (err) {
      setValidationStatus('error');
      setValidationMessage('连接失败: ' + (err instanceof Error ? err.message : '网络错误'));
    } finally {
      setIsValidating(false);
    }
  };

  // 加载统计数据：使用多种机制确保数据能被加载
  useEffect(() => {
    // 如果还在加载认证状态，跳过
    if (authLoading) return;

    // 游客模式下也要检查本地数据（孤儿数据检测）
    if (!user) {
      checkLocalData();
      const timer = setTimeout(() => checkLocalData(), 500);
      return () => clearTimeout(timer);
    }

    // 直接尝试加载
    loadStats();
    checkLocalData();

    // 延迟再次尝试，确保 handleLogin 等异步流程完成
    const timer = setTimeout(() => {
      loadStats();
      loadThinkingStats();
      checkLocalData();
    }, 500);

    return () => clearTimeout(timer);
  }, [authLoading, user?.id, profile?.id]);

  // 检查本地数据状态
  const checkLocalData = () => {
    const hasUnsynced = checkUnsyncedData();
    const stats = getLocalDataStats();
    setHasUnsyncedData(hasUnsynced);
    setLocalDataCount(stats.count);

    // 孤儿数据检测：游客模式下检查是否有之前登录用户的数据
    if (!isAuthenticated && !user) {
      const allKeys = Object.keys(localStorage);
      const userKeyPattern = /^user-([a-f0-9-]+)-/;
      const orphanUserIds = new Set<string>();
      let orphanDataCount = 0;

      allKeys.forEach(key => {
        const match = key.match(userKeyPattern);
        if (match) {
          orphanUserIds.add(match[1]);
          orphanDataCount++;
        }
      });

      if (orphanUserIds.size > 0 && orphanDataCount > 0) {
        const firstUserId = Array.from(orphanUserIds)[0];
        setOrphanDataInfo({ found: true, userId: firstUserId, dataCount: orphanDataCount });
      } else {
        setOrphanDataInfo(null);
      }
    } else {
      setOrphanDataInfo(null);
    }
  };

  // 监听用户数据变化事件（登录/登出时刷新）
  useEffect(() => {
    const handleDataChange = () => {
      // 延迟一下，确保 sessionStorage 和 React 状态都已更新
      setTimeout(() => {
        loadStats();
        loadThinkingStats();
        checkLocalData();
      }, 300);
    };

    window.addEventListener('user-data-changed', handleDataChange);
    window.addEventListener('user-logged-out', handleDataChange);
    window.addEventListener('user-logged-in', handleDataChange);

    return () => {
      window.removeEventListener('user-data-changed', handleDataChange);
      window.removeEventListener('user-logged-out', handleDataChange);
      window.removeEventListener('user-logged-in', handleDataChange);
    };
  }, []);

  const loadStats = () => {
    // 使用 userStorage 统一读取签到数据
    const checkInHistory = getUserDataSync<CheckInRecord[]>('checkin-history', []);

    // 加载思考记录统计（同时计算 totalAnswers）
    const { totalAnswers } = loadThinkingStats();

    setStats({
      totalAnswers,
      totalCheckIns: checkInHistory.length,
    });
  };

  const loadThinkingStats = (): { totalAnswers: number } => {
    // 逻辑推理统计
    const turtleSoupRecords = getTurtleSoupRecords();
    const riddleRecords = getRiddleRecords();
    const yesOrNoRecords = getYesOrNoRecords();
    const guessNumberRecords = getGuessNumberRecords();
    const logicTotal =
      turtleSoupRecords.length +
      riddleRecords.length +
      yesOrNoRecords.length +
      guessNumberRecords.length;

    // 问题思考统计
    const answers = getAnswers();
    const questionTotal = answers.length;

    // 写作创造统计
    const slotMachineRecords = getSlotMachineResults();
    const writingChallengeRecords = getUserDataSync<any[]>('writing-challenge-works', []);
    const writingTotal = slotMachineRecords.length + writingChallengeRecords.length;

    // 计算总答题数 = 思维逻辑 + 问题思考 + 写作创造
    const totalAnswers = logicTotal + questionTotal + writingTotal;

    setThinkingStats({
      logicReasoning: logicTotal,
      questionThinking: questionTotal,
      writingCreation: writingTotal,
    });

    return { totalAnswers };
  };

  const handleEditProfile = () => {
    setEditData({
      username: profile?.username || '',
      gender: profile?.gender || '',
      age: profile?.age ? profile.age.toString() : '',
      bio: profile?.bio || '',
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const updates: any = {};
      if (editData.username) updates.username = editData.username;
      if (editData.gender) updates.gender = editData.gender;
      if (editData.age) updates.age = parseInt(editData.age, 10);
      if (editData.bio) updates.bio = editData.bio;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setIsEditing(false);
      alert('资料已更新');
    } catch (error) {
      console.error('更新资料失败:', error);
      alert('更新失败');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 先删除旧头像
      try {
        const { data: existingFiles } = await supabase.storage
          .from('avatars')
          .list(user.id);

        if (existingFiles && existingFiles.length > 0) {
          const oldFilePaths = existingFiles.map((f) => `${user.id}/${f.name}`);
          await supabase.storage.from('avatars').remove(oldFilePaths);
        }
      } catch (error) {
        console.warn('删除旧头像时出错（可以忽略）:', error);
      }

      // 上传新头像
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // 获取公共URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 更新用户资料
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(updatedProfile);
      alert('头像上传成功');
    } catch (error) {
      console.error('上传头像失败:', error);
      alert('上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      // 使用useAuth hook中的signOut函数
      // signOut 会在成功后自动刷新页面，不需要手动导航
      const result = await authSignOut();
      if (!result.success) {
        console.error('登出失败:', result.error);
        // 如果失败，手动刷新页面
        window.location.reload();
      }
      // 如果成功，signOut 内部会在 500ms 后刷新页面
    }
  };

  const handleExport = () => {
    try {
      const data = exportDataAsJSON();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wanwan-xiangdao-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('数据导出成功');
    } catch (error) {
      alert('导出失败');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const success = importDataFromJSON(text);
        if (success) {
          alert('导入成功！');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          alert('导入失败');
        }
      } catch (error) {
        alert('导入失败');
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有本地数据吗？')) {
      clearAllData();
      alert('数据已清除');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  // 提交用户反馈
  const handleSubmitFeedback = async () => {
    setIsSubmittingFeedback(true);
    setFeedbackError('');

    const result = await submitFeedback({
      content: feedbackContent,
      contactEmail: feedbackEmail || undefined,
    });

    setIsSubmittingFeedback(false);

    if (result.success) {
      setFeedbackSuccess(true);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSuccess(false);
        setFeedbackContent('');
        setFeedbackEmail('');
      }, 2000);
    } else {
      setFeedbackError(result.error || '提交失败');
    }
  };

  // 打开反馈弹窗
  const handleOpenFeedback = () => {
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      toast.warning(`请稍后再试，还需等待约 ${rateLimit.remainingMinutes} 分钟`);
      return;
    }
    setFeedbackError('');
    setFeedbackSuccess(false);
    setShowFeedbackModal(true);
  };

  // 手动同步到云端
  const handleSyncToCloud = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      toast.error('请先登录');
      return;
    }

    setIsSyncing(true);

    try {
      const result = await manualSync();

      if (result.success) {
        toast.success(`✅ 已同步 ${result.uploaded} 条数据到云端`);
        // 同步成功后更新 UI 状态（不重新检查，因为 checkUnsyncedData 已通过 synced keys 标记处理）
        setHasUnsyncedData(false);
        setLocalDataCount(0);
      } else {
        toast.error(`❌ 同步失败: ${result.error}`);
      }
    } catch (error) {
      console.error('同步失败:', error);
      toast.error('❌ 同步失败，请稍后重试');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg-picture/bg-index.jpg)' }}
      />
      {/* 半透明渐变遮罩 - 顶部更实，底部自然过渡 */}
      <div className="fixed inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.55) 100%)' }} />
      <div className="hidden dark:block fixed inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,41,0.75) 0%, rgba(15,23,41,0.55) 20%, rgba(15,23,41,0.4) 50%, rgba(15,23,41,0.6) 100%)' }} />
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">返回</span>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <User size={28} className="text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-700">个人中心</h1>
          </div>
          {/* 用户信息卡片 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-2 border-blue-200 mb-8"
          >
            <div className="bg-gradient-to-br from-white/15 to-white/25 backdrop-blur-xl p-8 border-b border-white/20 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="w-20 h-20 rounded-2xl bg-gray-100/60 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-lg border border-gray-200/50"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="用户头像"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={40} className="text-gray-500" />
                    )}
                  </motion.div>
                  {isAuthenticated && (
                    <label className="absolute -bottom-2 -right-2 bg-gray-100 rounded-full p-1.5 shadow-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
                      <Camera size={14} className="text-blue-500" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        <input
                          type="text"
                          placeholder="用户名"
                          value={editData.username}
                          onChange={(e) =>
                            setEditData({ ...editData, username: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-gray-100/80 text-gray-800 placeholder-gray-400 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
                        />
                        <div className="flex gap-2">
                          <select
                            value={editData.gender}
                            onChange={(e) =>
                              setEditData({ ...editData, gender: e.target.value })
                            }
                            className="px-3 py-2 bg-gray-100/80 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
                          >
                            <option value="">选择性别</option>
                            <option value="男">男</option>
                            <option value="女">女</option>
                            <option value="其他">其他</option>
                          </select>
                          <input
                            type="number"
                            placeholder="年龄"
                            value={editData.age}
                            onChange={(e) =>
                              setEditData({ ...editData, age: e.target.value })
                            }
                            className="px-3 py-2 bg-gray-100/80 text-gray-800 placeholder-gray-400 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
                          />
                        </div>
                        <textarea
                          placeholder="个人简介"
                          value={editData.bio}
                          onChange={(e) =>
                            setEditData({ ...editData, bio: e.target.value })
                          }
                          rows={2}
                          className="w-full px-3 py-2 bg-gray-100/80 text-gray-800 placeholder-gray-400 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm resize-none"
                        />
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSaveProfile}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-md transition-all"
                          >
                            <Check size={16} />
                            保存
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all"
                          >
                            <X size={16} />
                            取消
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                          {profile?.username || user?.email || '游客用户'}
                        </h2>
                        {(profile?.gender || profile?.age || profile?.bio) && (
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-gray-600 text-sm mb-1">
                            {profile?.gender && <span>性别: {profile.gender}</span>}
                            {profile?.age && <span>年龄: {profile.age}岁</span>}
                          </div>
                        )}
                        {profile?.bio && (
                          <p className="text-gray-600 text-sm mb-2">{profile.bio}</p>
                        )}
                        <p className="text-gray-500 text-sm">
                          {isAuthenticated ? '已登录' : '游客模式'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-2">
                  {isAuthenticated && !isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEditProfile}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-md transition-all"
                    >
                      <Edit2 size={14} />
                      编辑
                    </motion.button>
                  )}
                  {isAuthenticated && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all"
                    >
                      退出登录
                    </motion.button>
                  )}
                  {!isAuthenticated && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-md transition-all"
                    >
                      去登录
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* 用户统计 */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-500" />
                  学习统计
                </h3>
                {/* 云端同步状态指示器 */}
                {isAuthenticated && (
                  <SyncStatusIndicator
                    status={syncStatus}
                    lastSync={lastSync}
                    isSyncing={isSyncing}
                    onManualSync={manualSync}
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-xl p-4 border border-blue-300/50 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/UI-picture/UI-profile2.jpg')", filter: 'brightness(0.7)' }} />
                  <div className="relative">
                    <div className="text-sm text-white/80 mb-2">答题总数</div>
                    <p className="text-2xl font-bold text-white">{stats.totalAnswers}</p>
                  </div>
                </div>

                <div className="relative rounded-xl p-4 border border-green-300/50 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/UI-picture/UI-profile1.jpg')", filter: 'brightness(0.7)' }} />
                  <div className="relative">
                    <div className="text-sm text-white/80 mb-2">累计签到</div>
                    <p className="text-2xl font-bold text-white">{stats.totalCheckIns}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 孤儿数据提示：游客模式下检测到之前登录用户的数据 */}
          <AnimatePresence>
            {orphanDataInfo?.found && !isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mb-8 shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                    <Lightbulb size={20} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-800 mb-1">发现未同步的数据</h3>
                    <p className="text-sm text-amber-700 mb-3">
                      检测到本地有 {orphanDataInfo.dataCount} 项之前登录时产生的数据。
                      登录后这些数据会自动同步到云端，方便你在不同设备间访问。
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium shadow-md transition-all"
                    >
                      立即登录恢复数据
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 思考记录统计 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-blue-200 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">思考记录</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 逻辑推理 */}
              <div className="relative rounded-xl p-5 border-2 border-red-300/50 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/UI-picture/UI-logic1.jpg')", filter: 'brightness(0.7)' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/60 to-orange-900/50" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-red-500/80 backdrop-blur-sm rounded-lg">
                      <Brain size={22} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">逻辑推理</h4>
                      <p className="text-xs text-white/70">锻炼逻辑思维</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {thinkingStats.logicReasoning}
                  </div>
                  <p className="text-sm text-white/70">游戏次数</p>
                </div>
              </div>

              {/* 问题思考 */}
              <div className="relative rounded-xl p-5 border-2 border-amber-300/50 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/UI-picture/UI-question1.jpg')", filter: 'brightness(0.7)' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 to-yellow-900/50" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-amber-500/80 backdrop-blur-sm rounded-lg">
                      <Lightbulb size={22} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">问题思考</h4>
                      <p className="text-xs text-white/70">深度思考问题</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {thinkingStats.questionThinking}
                  </div>
                  <p className="text-sm text-white/70">答题数量</p>
                </div>
              </div>

              {/* 写作创造 */}
              <div className="relative rounded-xl p-5 border-2 border-blue-300/50 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/icon-picture/icon-writing1.jpg')", filter: 'brightness(0.7)' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-indigo-900/50" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-blue-500/80 backdrop-blur-sm rounded-lg">
                      <PenTool size={22} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">写作创造</h4>
                      <p className="text-xs text-white/70">激发创意思维</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {thinkingStats.writingCreation}
                  </div>
                  <p className="text-sm text-white/70">创作次数</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI 大模型配置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-indigo-200 mb-8"
            id="ai-config"
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Bot size={20} className="text-indigo-500" />
              AI 大模型配置
              {llmConfig && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium text-green-600 bg-green-50 rounded-full border border-green-200">
                  已配置
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 mb-4">配置 AI 模型用于圆桌讨论、海龟汤等需要 AI 的功能模块</p>

            {/* 配置指南入口 */}
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors mb-4"
            >
              <HelpCircle size={16} />
              不知道怎么配置？查看配置指南
              {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* 配置指南内容 */}
            <AnimatePresence>
              {showGuide && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="bg-indigo-50/60 backdrop-blur-sm rounded-xl border border-indigo-200/50 p-5 space-y-5">
                    {/* 总体步骤 */}
                    <div>
                      <h4 className="text-sm font-bold text-indigo-800 mb-2">配置步骤（通用）</h4>
                      <ol className="text-xs text-indigo-700 space-y-1.5 list-decimal list-inside">
                        <li>选择一个 AI 服务商（下方有各服务商的获取指引）</li>
                        <li>前往该服务商官网注册账号并登录</li>
                        <li>在控制台 / API 管理页面创建 API Key</li>
                        <li>将 API Key 粘贴到上方的输入框中</li>
                        <li>选择你想要使用的模型，然后点击「保存配置」</li>
                      </ol>
                    </div>

                    {/* 各服务商详细指南 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-indigo-800">各服务商获取 API Key 指南</h4>

                      {/* DeepSeek */}
                      <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-gray-800">DeepSeek</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded">推荐 · 性价比高</span>
                        </div>
                        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                          <li>访问 <span className="font-mono text-indigo-600">platform.deepseek.com</span> 注册/登录</li>
                          <li>进入左侧菜单「API Keys」</li>
                          <li>点击「Create API Key」，复制生成的 Key</li>
                        </ol>
                        <p className="text-[10px] text-gray-400 mt-1.5">推荐模型：deepseek-chat（日常使用）/ deepseek-reasoner（深度推理）</p>
                      </div>

                      {/* 通义千问 */}
                      <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-gray-800">通义千问 (Qwen)</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">阿里云</span>
                        </div>
                        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                          <li>访问 <span className="font-mono text-indigo-600">dashscope.console.aliyun.com</span> 登录阿里云账号</li>
                          <li>开通「DashScope」服务（开通免费）</li>
                          <li>进入「API-KEY 管理」→「创建新的 API Key」，复制生成的 Key</li>
                        </ol>
                        <p className="text-[10px] text-gray-400 mt-1.5">推荐模型：qwen-plus（均衡）/ qwen-max（最强）</p>
                      </div>

                      {/* 智谱 GLM */}
                      <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-gray-800">智谱 GLM</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">有免费额度</span>
                        </div>
                        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                          <li>访问 <span className="font-mono text-indigo-600">open.bigmodel.cn</span> 注册/登录</li>
                          <li>进入「API Keys」页面</li>
                          <li>点击「添加 API Key」，复制生成的 Key</li>
                        </ol>
                        <p className="text-[10px] text-gray-400 mt-1.5">推荐模型：glm-4-flash（免费）/ glm-4-plus（高性能）</p>
                      </div>

                      {/* Kimi */}
                      <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-gray-800">Kimi (Moonshot)</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-orange-100 text-orange-700 rounded">长文本</span>
                        </div>
                        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                          <li>访问 <span className="font-mono text-indigo-600">platform.moonshot.cn</span> 注册/登录</li>
                          <li>进入「API Key 管理」</li>
                          <li>点击「创建新的 API Key」，复制生成的 Key</li>
                        </ol>
                        <p className="text-[10px] text-gray-400 mt-1.5">推荐模型：moonshot-v1-8k</p>
                      </div>

                      {/* 豆包 */}
                      <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-gray-800">豆包 (字节跳动)</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">火山引擎</span>
                        </div>
                        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                          <li>访问 <span className="font-mono text-indigo-600">console.volcengine.com/ark</span> 登录火山引擎账号</li>
                          <li>开通「方舟」(ARK) 服务</li>
                          <li>创建接入点（模型推理服务），获取 API Key</li>
                        </ol>
                        <p className="text-[10px] text-gray-400 mt-1.5">推荐模型：doubao-pro-32k</p>
                      </div>
                    </div>

                    {/* 常见问题 */}
                    <div>
                      <h4 className="text-sm font-bold text-indigo-800 mb-2">常见问题</h4>
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium text-indigo-700">Q: API Key 是免费的吗？</span>
                          <p className="text-gray-500 ml-2">A: 大部分服务商注册后会赠送免费额度，用完后按量付费。智谱 GLM 的 glm-4-flash 模型长期免费。</p>
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium text-indigo-700">Q: 我的 API Key 安全吗？</span>
                          <p className="text-gray-500 ml-2">A: API Key 仅保存在你的浏览器本地（localStorage），不会上传到我们的服务器。</p>
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium text-indigo-700">Q: 保存配置后仍然连接失败？</span>
                          <p className="text-gray-500 ml-2">A: 请检查网络环境是否可以访问对应服务商的 API 地址，部分服务商需要海外网络。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Provider 选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">AI 服务商</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as LLMProvider)}
                className="w-full px-3 py-2.5 bg-white/30 backdrop-blur-sm border border-gray-300/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-colors"
              >
                <option value="deepseek">DeepSeek</option>
                <option value="qwen">通义千问</option>
                <option value="glm">智谱 GLM</option>
                <option value="kimi">Kimi (Moonshot)</option>
                <option value="doubao">豆包 (字节)</option>
              </select>
            </div>

            {/* API Key */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="输入你的 API Key..."
                  className="w-full px-3 py-2.5 pr-10 bg-white/30 backdrop-blur-sm border border-gray-300/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Model 选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">模型</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/30 backdrop-blur-sm border border-gray-300/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-colors"
              >
                {(() => {
                  const config = getProviderConfig(aiProvider);
                  return config.models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ));
                })()}
              </select>
            </div>

            {/* 高级设置 */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronDown size={14} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                高级设置
              </button>
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">自定义 Base URL</label>
                      <input
                        type="text"
                        value={aiBaseUrl}
                        onChange={(e) => setAiBaseUrl(e.target.value)}
                        placeholder={getProviderConfig(aiProvider).baseUrl}
                        className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-colors font-mono"
                      />
                      <p className="text-xs text-gray-400 mt-1">留空则使用默认地址</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 验证状态 */}
            <AnimatePresence>
              {validationStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    validationStatus === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {validationStatus === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
                    {validationMessage}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTestConnection}
                disabled={isValidating || !apiKey.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/30 backdrop-blur-sm hover:bg-white/40 text-gray-700 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {isValidating ? '测试中...' : '测试连接'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveAIConfig}
                disabled={!apiKey.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={16} />
                保存配置
              </motion.button>

              {llmConfig && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    clearLLMConfig();
                    setApiKey('');
                    setAiBaseUrl('');
                    setValidationStatus('idle');
                    toast.success('已清除 AI 配置');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all"
                >
                  <Trash2 size={16} />
                  清除
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* 设置卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-blue-200 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Settings size={20} className="text-blue-500" />
              数据管理
            </h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSyncToCloud}
                disabled={isSyncing || !hasUnsyncedData}
                className="w-full relative flex items-center gap-3 px-4 py-3 text-purple-700 rounded-xl transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('/icon-picture/icon-profile.jpg')" }} />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200/50 to-indigo-200/40" />
                <div className="relative flex items-center gap-3 w-full">
                {isSyncing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
                ) : (
                  <Upload size={20} />
                )}
                <div className="flex-1 text-left">
                  <p className="font-medium">
                    {isSyncing ? '同步中...' : '同步至云端'}
                  </p>
                  <p className="text-sm text-purple-600">
                    {hasUnsyncedData
                      ? `本地有 ${localDataCount} 项数据未同步`
                      : '所有数据已是最新'}
                  </p>
                </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="w-full relative flex items-center gap-3 px-4 py-3 text-blue-700 rounded-xl transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('/icon-picture/icon-writing1.jpg')" }} />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 to-cyan-200/40" />
                <div className="relative flex items-center gap-3 w-full">
                <Download size={20} />
                <div className="flex-1 text-left">
                  <p className="font-medium">导出数据</p>
                  <p className="text-sm text-blue-600">备份所有数据到本地</p>
                </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImport}
                className="w-full relative flex items-center gap-3 px-4 py-3 text-green-700 rounded-xl transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('/icon-picture/icon-knowledge1.jpg')" }} />
                <div className="absolute inset-0 bg-gradient-to-r from-green-200/50 to-emerald-200/40" />
                <div className="relative flex items-center gap-3 w-full">
                <Upload size={20} />
                <div className="flex-1 text-left">
                  <p className="font-medium">导入数据</p>
                  <p className="text-sm text-green-600">从备份文件恢复数据</p>
                </div>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* 用户体验反馈 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-emerald-200 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <MessageSquare size={20} className="text-emerald-500" />
              用户体验反馈
            </h3>
            <p className="text-sm text-gray-500 mb-4">分享你的使用感受、建议或遇到的问题，帮助我们做得更好</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenFeedback}
              className="w-full relative flex items-center gap-3 px-4 py-3 text-emerald-700 rounded-xl transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('/icon-picture/icon-creative1.jpg')" }} />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/50 to-teal-200/40" />
              <div className="relative flex items-center gap-3 w-full">
                <Send size={20} />
                <div className="flex-1 text-left">
                  <p className="font-medium">提交反馈</p>
                  <p className="text-sm text-emerald-600">告诉我们你的想法</p>
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* 反馈弹窗 */}
          <AnimatePresence>
            {showFeedbackModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => {
                  if (!isSubmittingFeedback) setShowFeedbackModal(false);
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {feedbackSuccess ? (
                    <div className="p-8 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">感谢你的反馈！</h3>
                      <p className="text-sm text-gray-500">我们会认真阅读并持续改进</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare size={20} className="text-emerald-500" />
                            提交反馈
                          </h3>
                          <button
                            onClick={() => setShowFeedbackModal(false)}
                            disabled={isSubmittingFeedback}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <textarea
                            value={feedbackContent}
                            onChange={(e) => setFeedbackContent(e.target.value)}
                            placeholder="分享你的使用感受、建议或遇到的问题..."
                            rows={5}
                            maxLength={2000}
                            className="w-full px-4 py-3 bg-gray-50/80 text-gray-800 placeholder-gray-400 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 resize-none text-sm transition-colors"
                          />
                          <div className="flex justify-end mt-1">
                            <span className="text-xs text-gray-400">
                              {feedbackContent.length}/2000
                            </span>
                          </div>
                        </div>

                        {/* 游客或未填 email 时显示联系方式 */}
                        {(!isAuthenticated || !profile?.email) && (
                          <div>
                            <input
                              type="email"
                              value={feedbackEmail}
                              onChange={(e) => setFeedbackEmail(e.target.value)}
                              placeholder="联系方式（可选，方便我们回复你）"
                              className="w-full px-4 py-2.5 bg-gray-50/80 text-gray-800 placeholder-gray-400 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 text-sm transition-colors"
                            />
                          </div>
                        )}

                        {feedbackError && (
                          <div className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                            {feedbackError}
                          </div>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSubmitFeedback}
                          disabled={isSubmittingFeedback || feedbackContent.trim().length < 5}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingFeedback ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              提交中...
                            </>
                          ) : (
                            <>
                              <Send size={16} />
                              提交反馈
                            </>
                          )}
                        </motion.button>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 危险区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-red-200"
          >
            <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
              <Trash2 size={20} className="text-red-500" />
              危险操作
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearData}
              className="w-full relative flex items-center gap-3 px-4 py-3 text-red-700 rounded-xl transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('/icon-picture/icon-logic1.jpg')" }} />
              <div className="absolute inset-0 bg-gradient-to-r from-red-200/50 to-rose-200/40" />
              <div className="relative flex items-center gap-3 w-full">
              <Trash2 size={20} />
              <div className="flex-1 text-left">
                <p className="font-medium">清除所有数据</p>
                <p className="text-sm text-red-600">删除所有本地存储的数据（不可恢复）</p>
              </div>
                </div>
            </motion.button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
