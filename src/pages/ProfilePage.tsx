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

  // 云端同步状态
  const { syncStatus, lastSync, manualSync: oldManualSync } = useSync(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadStats();
      checkLocalData();
    }
  }, [authLoading, user]);

  // 检查本地数据状态
  const checkLocalData = () => {
    const hasUnsynced = checkUnsyncedData();
    const stats = getLocalDataStats();
    setHasUnsyncedData(hasUnsynced);
    setLocalDataCount(stats.count);
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
    const answers = getAnswers();

    // 使用 userStorage 统一读取签到数据
    const checkInHistory = getUserDataSync<CheckInRecord[]>('checkin-history', []);

    setStats({
      totalAnswers: answers.length,
      totalCheckIns: checkInHistory.length,
    });

    // 加载思考记录统计
    loadThinkingStats();
  };

  const loadThinkingStats = () => {
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

    setThinkingStats({
      logicReasoning: logicTotal,
      questionThinking: questionTotal,
      writingCreation: writingTotal,
    });
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
      // 使用useAuth hook中的signOut函数，确保数据正确清除
      const result = await authSignOut();
      if (result.success) {
        navigate('/');
      } else {
        console.error('登出失败:', result.error);
        // 即使失败也尝试导航到首页
        navigate('/');
      }
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
        setHasUnsyncedData(false);
        setLocalDataCount(0);
        checkLocalData();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">返回</span>
            </motion.button>

            <div className="flex items-center gap-3">
              <User size={24} className="text-blue-500" />
              <h1 className="text-xl font-bold text-blue-700">个人中心</h1>
            </div>

            <div className="w-16" />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 用户信息卡片 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-blue-200 mb-8"
          >
            <div className="bg-gradient-to-br from-gray-50/90 to-gray-100/90 backdrop-blur-xl p-8 border-b border-gray-200/50 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="w-20 h-20 rounded-2xl bg-white/60 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-lg border border-gray-200/50"
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
                    <label className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
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
                          className="w-full px-3 py-2 bg-white/80 text-gray-800 placeholder-gray-400 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
                        />
                        <div className="flex gap-2">
                          <select
                            value={editData.gender}
                            onChange={(e) =>
                              setEditData({ ...editData, gender: e.target.value })
                            }
                            className="px-3 py-2 bg-white/80 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
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
                            className="px-3 py-2 bg-white/80 text-gray-800 placeholder-gray-400 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
                          />
                        </div>
                        <textarea
                          placeholder="个人简介"
                          value={editData.bio}
                          onChange={(e) =>
                            setEditData({ ...editData, bio: e.target.value })
                          }
                          rows={2}
                          className="w-full px-3 py-2 bg-white/80 text-gray-800 placeholder-gray-400 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm resize-none"
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
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-sm text-gray-600 mb-2">答题总数</div>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalAnswers}</p>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-sm text-gray-600 mb-2">累计签到</div>
                  <p className="text-2xl font-bold text-green-600">{stats.totalCheckIns}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 思考记录统计 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">思考记录</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 逻辑推理 */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-red-500 rounded-lg">
                    <Brain size={22} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">逻辑推理</h4>
                    <p className="text-xs text-gray-600">锻炼逻辑思维</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {thinkingStats.logicReasoning}
                </div>
                <p className="text-sm text-gray-600">游戏次数</p>
              </div>

              {/* 问题思考 */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border-2 border-amber-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-amber-500 rounded-lg">
                    <Lightbulb size={22} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">问题思考</h4>
                    <p className="text-xs text-gray-600">深度思考问题</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-600 mb-2">
                  {thinkingStats.questionThinking}
                </div>
                <p className="text-sm text-gray-600">答题数量</p>
              </div>

              {/* 写作创造 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-blue-500 rounded-lg">
                    <PenTool size={22} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">写作创造</h4>
                    <p className="text-xs text-gray-600">激发创意思维</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {thinkingStats.writingCreation}
                </div>
                <p className="text-sm text-gray-600">创作次数</p>
              </div>
            </div>
          </motion.div>

          {/* 设置卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200 mb-8"
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
                className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all"
              >
                <Download size={20} />
                <div className="flex-1 text-left">
                  <p className="font-medium">导出数据</p>
                  <p className="text-sm text-blue-600">备份所有数据到本地</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImport}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-all"
              >
                <Upload size={20} />
                <div className="flex-1 text-left">
                  <p className="font-medium">导入数据</p>
                  <p className="text-sm text-green-600">从备份文件恢复数据</p>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* 危险区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-200"
          >
            <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
              <Trash2 size={20} className="text-red-500" />
              危险操作
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearData}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-all"
            >
              <Trash2 size={20} />
              <div className="flex-1 text-left">
                <p className="font-medium">清除所有数据</p>
                <p className="text-sm text-red-600">删除所有本地存储的数据（不可恢复）</p>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
