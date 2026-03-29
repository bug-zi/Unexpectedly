/**
 * 用户个人资料页面
 * 显示用户信息、统计数据和设置
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Settings,
  Bell,
  Lock,
  Database,
  Download,
  Upload,
  Trash2,
  Calendar,
  Award,
  Target,
  TrendingUp,
  Camera,
  Edit2,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSync } from '@/hooks/useSync';
import { SyncStatusIndicator } from '@/components/ui/SyncStatusIndicator';
import { restoreFromCloud } from '@/services/syncService';
import { exportDataAsJSON, importDataFromJSON, clearAllData, getAnswers, getUserData } from '@/utils/storage';
import { getTurtleSoupRecords, getRiddleRecords, getYesOrNoRecords, getGuessNumberRecords } from '@/utils/storage';
import { toast } from 'react-toastify';

interface UserStats {
  totalAnswers: number;
  totalCheckIns: number;
  totalTurtleSoup: number;
  totalRiddles: number;
  totalYesOrNo: number;
  totalGuessNumber: number;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, uploadAvatar, isAuthenticated } = useAuth();
  const { syncStatus, lastSync, isSyncing, manualSync } = useSync(false);

  const [stats, setStats] = useState<UserStats>({
    totalAnswers: 0,
    totalCheckIns: 0,
    totalTurtleSoup: 0,
    totalRiddles: 0,
    totalYesOrNo: 0,
    totalGuessNumber: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    bio: '',
    gender: '',
    age: '',
    birthday: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const answers = getAnswers();
    const checkInHistory = getUserData<any[]>('checkin-history', []);

    const turtleSoupRecords = getTurtleSoupRecords();
    const riddleRecords = getRiddleRecords();
    const yesOrNoRecords = getYesOrNoRecords();
    const guessNumberRecords = getGuessNumberRecords();

    setStats({
      totalAnswers: answers.length,
      totalCheckIns: checkInHistory.length,
      totalTurtleSoup: turtleSoupRecords.length,
      totalRiddles: riddleRecords.length,
      totalYesOrNo: yesOrNoRecords.length,
      totalGuessNumber: guessNumberRecords.length
    });
  };

  const handleEditProfile = () => {
    setEditData({
      username: profile?.username || '',
      bio: profile?.bio || '',
      gender: profile?.gender || '',
      age: profile?.age ? profile.age.toString() : '',
      birthday: profile?.birthday || '',
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile(editData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('🎯 用户选择了文件:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件', { autoClose: 3000 });
      console.error('❌ 文件类型错误:', file.type);
      return;
    }

    // 验证文件大小（最大2MB）
    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过2MB', { autoClose: 3000 });
      console.error('❌ 文件太大:', file.size);
      return;
    }

    console.log('✅ 文件验证通过，开始上传');
    setIsUploading(true);
    try {
      const result = await uploadAvatar(file);

      if (result.success) {
        console.log('✅ 上传成功！');
        toast.success('头像上传成功！', { autoClose: 2000 });
      } else {
        console.error('❌ 上传失败:', result.error);
        // 显示详细错误信息
        toast.error(result.error || '上传失败，请稍后重试', {
          autoClose: 7000,
          closeButton: true
        });
      }
    } catch (error) {
      console.error('❌ 上传头像时发生异常:', error);
      toast.error(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`, {
        autoClose: 5000
      });
    } finally {
      setIsUploading(false);
      console.log('🔄 上传流程结束');
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
      toast.success('数据导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败，请重试');
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
          toast.success('导入成功！');
          loadStats();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast.error('导入失败，请检查文件格式');
        }
      } catch (error) {
        console.error('导入失败:', error);
        toast.error('导入失败，请检查文件格式');
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有本地数据吗？此操作不可恢复！')) {
      if (confirm('再次确认：这将删除所有答题记录、签到记录和游戏进度！')) {
        clearAllData();
        toast.success('数据已清除');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }
  };

  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      const result = await signOut();
      if (result.success) {
        navigate('/');
      }
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }

    if (confirm('确定要从云端恢复数据吗？这将覆盖本地数据！')) {
      try {
        const success = await restoreFromCloud();
        if (success) {
          toast.success('恢复成功！');
          loadStats();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast.error('恢复失败，请稍后重试');
        }
      } catch (error) {
        console.error('恢复失败:', error);
        toast.error('恢复失败，请稍后重试');
      }
    }
  };

  const bestStreak = getUserData<number>('checkin-best', 0);
  const consecutiveDays = getUserData<number>('checkin-consecutive', 0);

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">返回</span>
            </motion.button>

            <div className="flex items-center gap-3">
              <User size={24} className="text-blue-500" />
              <h1 className="text-xl font-bold text-blue-700 dark:text-blue-300">
                个人中心
              </h1>
            </div>

            <div className="w-16">
              {/* 占位，保持布局平衡 */}
            </div>
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
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-800 mb-8"
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-8">
              <div className="flex items-start gap-4">
                {/* 头像 */}
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="用户头像"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={40} className="text-white" />
                    )}
                  </motion.div>

                  {isAuthenticated && (
                    <label className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera size={14} className="text-blue-500" />
                      )}
                    </label>
                  )}
                </div>

                {/* 用户信息 */}
                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <input
                          type="text"
                          value={editData.username}
                          onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                          placeholder="用户名"
                          className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-lg border border-white/30 focus:outline-none focus:border-white"
                        />
                        <div className="flex gap-2">
                          <select
                            value={editData.gender}
                            onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                            className="flex-1 px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/30 focus:outline-none focus:border-white"
                          >
                            <option value="" className="text-gray-800">请选择性别</option>
                            <option value="男" className="text-gray-800">男</option>
                            <option value="女" className="text-gray-800">女</option>
                            <option value="其他" className="text-gray-800">其他</option>
                          </select>
                          <input
                            type="number"
                            value={editData.age}
                            onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                            placeholder="年龄"
                            min="1"
                            max="150"
                            className="flex-1 px-3 py-2 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-lg border border-white/30 focus:outline-none focus:border-white"
                          />
                        </div>
                        <input
                          type="date"
                          value={editData.birthday}
                          onChange={(e) => setEditData({ ...editData, birthday: e.target.value })}
                          className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/30 focus:outline-none focus:border-white"
                        />
                        <textarea
                          value={editData.bio}
                          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                          placeholder="个人简介"
                          rows={2}
                          className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-lg border border-white/30 focus:outline-none focus:border-white resize-none"
                        />
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSaveProfile}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white text-blue-600 rounded-lg text-sm font-medium"
                          >
                            <Check size={16} />
                            保存
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm font-medium"
                          >
                            <X size={16} />
                            取消
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="view"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <h2 className="text-2xl font-bold text-white mb-1">
                          {profile?.username || user?.email || '游客用户'}
                        </h2>
                        {(profile?.gender || profile?.age || profile?.birthday) && (
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-blue-100 text-sm mb-1">
                            {profile?.gender && <span>性别: {profile.gender}</span>}
                            {profile?.age && <span>年龄: {profile.age}岁</span>}
                            {profile?.birthday && <span>生日: {profile.birthday}</span>}
                          </div>
                        )}
                        {profile?.username && (
                          <p className="text-blue-100 text-sm mb-1">@{profile.username}</p>
                        )}
                        {profile?.bio && (
                          <p className="text-blue-100 text-sm mb-2">{profile.bio}</p>
                        )}
                        <p className="text-blue-100 text-sm">
                          {isAuthenticated ? '已登录' : '游客模式'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-2">
                  {isAuthenticated && !isEditing && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEditProfile}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                      >
                        <Edit2 size={16} />
                        编辑资料
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all"
                      >
                        退出登录
                      </motion.button>
                    </>
                  )}
                  {!isAuthenticated && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 rounded-lg text-sm font-medium transition-all"
                    >
                      去登录
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* 用户统计 */}
            <div className="p-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" />
                学习统计
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={18} className="text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">答题总数</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalAnswers}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={18} className="text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">签到天数</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.totalCheckIns}
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={18} className="text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">最佳连续</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {bestStreak}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">当前连续</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {consecutiveDays}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 游戏统计 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award size={20} className="text-blue-500" />
              游戏统计
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">海龟汤</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.totalTurtleSoup}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">谜语人</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.totalRiddles}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Yes or No</p>
                <p className="text-xl font-bold text-pink-600 dark:text-pink-400">{stats.totalYesOrNo}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">猜数字</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.totalGuessNumber}</p>
              </div>
            </div>
          </motion.div>

          {/* 设置卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings size={20} className="text-blue-500" />
                数据管理
              </h3>
              {/* 同步状态指示器 */}
              {isAuthenticated && <SyncStatusIndicator status={syncStatus} lastSync={lastSync} isSyncing={isSyncing} onManualSync={manualSync} />}
            </div>
            <div className="space-y-3">
              {/* 云同步功能（仅登录用户可见） */}
              {isAuthenticated ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={manualSync}
                    disabled={isSyncing}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 dark:hover:from-blue-900/30 hover:to-indigo-100 dark:hover:to-indigo-900/30 text-blue-700 dark:text-blue-300 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className={`p-2 rounded-lg bg-blue-500 ${isSyncing ? 'animate-pulse' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3v1c0 1.7 1.3 3 3 3h11c1.7 0 3-1.3 3-3v-1z"/>
                        <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/>
                        <polyline points="16 9 12 5 8 9"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{isSyncing ? '同步中...' : '立即同步'}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {isSyncing ? '正在上传和下载数据' : '将本地数据同步到云端'}
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRestoreFromCloud}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-xl transition-all"
                  >
                    <div className="p-2 rounded-lg bg-cyan-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">从云端恢复</p>
                      <p className="text-sm text-cyan-600 dark:text-cyan-400">从云端下载并覆盖本地数据</p>
                    </div>
                  </motion.button>
                </>
              ) : (
                <div className="text-center py-4 px-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-700 dark:text-yellow-300 font-medium mb-1">登录以启用云同步</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-3">登录后自动备份数据到云端，永不丢失</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all"
                  >
                    立即登录
                  </motion.button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl transition-all"
              >
                <Download size={20} />
                <div className="flex-1 text-left">
                  <p className="font-medium">导出数据</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">备份所有数据到本地</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImport}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl transition-all"
              >
                <Upload size={20} />
                <div className="flex-1 text-left">
                  <p className="font-medium">导入数据</p>
                  <p className="text-sm text-green-600 dark:text-green-400">从备份文件恢复数据</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/notifications')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl transition-all"
              >
                <Bell size={20} />
                <div className="flex-1 text-left">
                  <p className="font-medium">通知设置</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">管理提醒通知</p>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* 危险区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-red-200 dark:border-red-800"
          >
            <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-4 flex items-center gap-2">
              <Database size={20} className="text-red-500" />
              危险操作
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearData}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl transition-all"
            >
              <Trash2 size={20} />
              <div className="flex-1 text-left">
                <p className="font-medium">清除所有数据</p>
                <p className="text-sm text-red-600 dark:text-red-400">删除所有本地存储的数据（不可恢复）</p>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
