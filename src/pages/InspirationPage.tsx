/**
 * 灵感源泉 - 灵感中心主页
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Dice5, PenTool, Rocket, Palette, GraduationCap, Coffee, Scale, AlertTriangle, Info, BarChart3, Zap, Anchor, Shuffle, X, Heart, Clock, TrendingUp, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { INSPIRATION_DOMAINS, DEPTH_CONFIG } from '@/constants/inspirationDomains';
import type { InspirationDomain } from '@/constants/inspirationDomains';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { useInspirationStore } from '@/stores/inspirationStore';
import { usePageSEO } from '@/hooks/usePageSEO';

const ICON_MAP: Record<string, React.ReactNode> = {
  PenTool: <PenTool size={48} />,
  Rocket: <Rocket size={48} />,
  Palette: <Palette size={48} />,
  GraduationCap: <GraduationCap size={48} />,
  Coffee: <Coffee size={48} />,
  Scale: <Scale size={48} />,
};

const DEPTH_ICONS: Record<string, React.ReactNode> = {
  Zap: <Zap size={18} className="text-yellow-500" />,
  Anchor: <Anchor size={18} className="text-blue-500" />,
  Shuffle: <Shuffle size={18} className="text-purple-500" />,
};

// 领域背景图映射
const DOMAIN_BG_IMAGES: Record<string, string> = {
  literary: '/UI-picture/UI-knowledge1.jpg',
  project: '/UI-picture/UI-knowledge2.jpg',
  design: '/UI-picture/UI-knowledge3.jpg',
  academic: '/UI-picture/UI-knowledge1.jpg',
  life: '/UI-picture/UI-knowledge2.jpg',
  philosophy: '/UI-picture/UI-knowledge3.jpg',
};

export function InspirationPage() {
  const navigate = useNavigate();
  const llmConfig = useRoundtableStore((state) => state.llmConfig);
  const recentItems = useInspirationStore((state) => state.getRecentItems(5));
  const history = useInspirationStore((state) => state.history);
  const removeFromHistory = useInspirationStore((state) => state.removeFromHistory);
  const updateHistoryItem = useInspirationStore((state) => state.updateHistoryItem);
  const { SEORender } = usePageSEO({ seo: '/inspiration' });

  const [showModeInfo, setShowModeInfo] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDomainClick = (domain: InspirationDomain) => {
    navigate(`/inspiration/${domain.id}`);
  };

  const handleRandomStart = () => {
    const randomDomain = INSPIRATION_DOMAINS[Math.floor(Math.random() * INSPIRATION_DOMAINS.length)];
    navigate(`/inspiration/${randomDomain.id}`);
  };

  // 统计数据
  const totalCount = history.length;
  const favoriteCount = history.filter((i) => i.isFavorite).length;
  const domainStats = INSPIRATION_DOMAINS.map((d) => ({
    ...d,
    count: history.filter((i) => i.domainId === d.id).length,
  })).sort((a, b) => b.count - a.count);
  const todayCount = history.filter((i) => {
    const created = new Date(i.createdAt);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length;
  const maxDomainCount = Math.max(...domainStats.map((d) => d.count), 1);

  return (
    <>
      {SEORender}
      <div className="min-h-screen relative">
        {/* 背景 */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/bg-picture/bg-konwledge2.jpg)' }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/60 dark:from-gray-900/90 dark:via-gray-900/85 dark:to-gray-900/80" />

        <div className="relative z-10">
          {/* 固定导航栏 */}
          <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative flex items-center justify-between h-16">
                {/* 左侧：返回按钮 */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span className="font-medium hidden sm:inline">返回</span>
                </motion.button>

                {/* 中间：标题和图标 */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Sparkles size={24} className="text-green-500 dark:text-green-400" />
                  </motion.div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                    灵感源泉
                  </h1>
                </div>

                {/* 右侧：功能按钮组 */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowModeInfo(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                  >
                    <Info size={18} />
                    <span className="hidden md:inline">模式说明</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRandomStart}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                  >
                    <Dice5 size={18} />
                    <span className="hidden md:inline">随机开始</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowHistory(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                  >
                    <Clock size={18} />
                    <span className="hidden md:inline">历史灵感</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowStats(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                  >
                    <BarChart3 size={18} />
                    <span className="hidden md:inline">灵感统计</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </nav>

          {/* 主要内容 */}
          <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {/* 标题区域 */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  点击一个方向，AI 为你生成
                  <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
                    {' '}不重样的灵感
                  </span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  选择你感兴趣的领域，让 AI 激发你的创造力
                </p>
              </motion.div>

          {/* AI 未配置警告 */}
          {!llmConfig && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3"
            >
              <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-amber-700 dark:text-amber-300 font-medium">请先配置 AI 模型</p>
                <p className="text-amber-600 dark:text-amber-400 text-sm">灵感源泉需要 AI 大模型支持</p>
              </div>
              <button
                onClick={() => navigate('/roundtable/setup')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                去配置
              </button>
            </motion.div>
          )}

          {/* 6张领域卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {INSPIRATION_DOMAINS.map((domain, index) => (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + index * 0.08 }}
              >
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    y: -6,
                    boxShadow: `0 20px 40px -12px ${domain.hoverShadow}`,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDomainClick(domain)}
                  className={`group relative w-full backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 ${domain.borderColor} ${domain.darkBorderColor} p-6 text-left overflow-hidden cursor-pointer`}
                  style={{
                    backgroundImage: `url(${DOMAIN_BG_IMAGES[domain.id]})`,
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* 背景遮罩 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${domain.gradient} ${domain.darkGradient}`} />

                  {/* 图标 */}
                  <div className="relative mb-4">
                    <motion.div
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-xl inline-block text-white"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {ICON_MAP[domain.icon]}
                    </motion.div>
                  </div>

                  {/* 标题和描述 */}
                  <div className="relative">
                    <h2 className="text-xl font-bold text-white mb-2">{domain.name}</h2>
                    <p className="text-white/80 text-sm mb-4">{domain.description}</p>

                    {/* 子类别预览 */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {domain.subcategories.slice(0, 3).map((sub) => (
                        <span
                          key={sub.id}
                          className="px-2 py-0.5 bg-white/15 backdrop-blur-sm rounded-full text-xs text-white/90"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {domain.subcategories.length > 3 && (
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/70">
                          +{domain.subcategories.length - 3}
                        </span>
                      )}
                    </div>

                    <motion.div
                      className="flex items-center text-white font-medium text-sm"
                      whileHover={{ x: 5 }}
                    >
                      探索灵感
                      <span className="ml-2">→</span>
                    </motion.div>
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

        {/* ==================== 模式说明弹窗 ==================== */}
        <AnimatePresence>
          {showModeInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModeInfo(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 头部 */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between rounded-t-2xl">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Info size={20} className="text-green-500" />
                    模式说明
                  </h2>
                  <button
                    onClick={() => setShowModeInfo(false)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                  {/* 什么是灵感源泉 */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">什么是灵感源泉？</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      灵感源泉是 AI 驱动的创意生成工具。选择一个你感兴趣的领域，AI 会根据你选择的方向和深度，实时生成独一无二的灵感内容，帮助你突破思维瓶颈。
                    </p>
                  </div>

                  {/* 六大领域 */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">六大灵感领域</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {INSPIRATION_DOMAINS.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => { setShowModeInfo(false); navigate(`/inspiration/${d.id}`); }}
                          className="text-left p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{d.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 三种深度 */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">三种生成深度</h3>
                    <div className="space-y-2">
                      {(Object.entries(DEPTH_CONFIG) as [string, typeof DEPTH_CONFIG[keyof typeof DEPTH_CONFIG]][]).map(
                        ([key, config]) => (
                          <div key={key} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="mt-0.5">{DEPTH_ICONS[config.icon]}</div>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">{config.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* 使用步骤 */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">如何使用</h3>
                    <div className="space-y-3">
                      {[
                        { step: '1', text: '选择一个灵感领域卡片，进入该领域' },
                        { step: '2', text: '在领域页选择具体的子方向和生成深度' },
                        { step: '3', text: '点击「生成灵感」，AI 会实时为你创作' },
                        { step: '4', text: '收藏喜欢的灵感，或点击「展开深入」获取更多' },
                      ].map((item) => (
                        <div key={item.step} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {item.step}
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== 灵感统计弹窗 ==================== */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowStats(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 头部 */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between rounded-t-2xl">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 size={20} className="text-green-500" />
                    灵感统计
                  </h2>
                  <button
                    onClick={() => setShowStats(false)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                  {/* 总览数据 */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                      <TrendingUp size={20} className="text-green-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">总灵感数</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl">
                      <Heart size={20} className="text-amber-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{favoriteCount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">已收藏</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                      <Clock size={20} className="text-blue-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayCount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">今日生成</p>
                    </div>
                  </div>

                  {/* 领域分布 */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">领域分布</h3>
                    <div className="space-y-3">
                      {domainStats.map((d) => (
                        <div key={d.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{d.name}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{d.count}</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${maxDomainCount > 0 ? (d.count / maxDomainCount) * 100 : 0}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 空状态 */}
                  {totalCount === 0 && (
                    <div className="text-center py-6">
                      <Sparkles size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 dark:text-gray-500 text-sm">还没有生成过灵感，快去试试吧！</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== 历史灵感弹窗 ==================== */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 头部 */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock size={20} className="text-green-500" />
                    历史灵感
                    <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({history.length})</span>
                  </h2>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>

                {/* 内容 */}
                <div className="px-6 py-4 overflow-y-auto flex-1">
                  {history.length === 0 ? (
                    <div className="text-center py-12">
                      <Sparkles size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 dark:text-gray-500 text-sm">还没有生成过灵感，快去试试吧！</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...history].reverse().map((item) => {
                        const domain = INSPIRATION_DOMAINS.find((d) => d.id === item.domainId);
                        const subcategory = domain?.subcategories.find((s) => s.id === item.subcategoryId);
                        const depthConfig = DEPTH_CONFIG[item.depth];
                        const isEditing = editingId === item.id;
                        const isDeleting = deletingId === item.id;
                        return (
                          <div
                            key={item.id}
                            className="w-full text-left p-4 bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-green-300 dark:hover:border-green-600 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {domain && (
                                <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                  {domain.name}
                                </span>
                              )}
                              {subcategory && (
                                <span className="text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                                  {subcategory.name}
                                </span>
                              )}
                              {depthConfig && (
                                <span className="text-xs px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-full">
                                  {depthConfig.name}
                                </span>
                              )}
                              {item.isFavorite && (
                                <Heart size={12} className="text-amber-500 fill-amber-500" />
                              )}
                              <div className="ml-auto flex items-center gap-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingId(item.id); setEditingContent(item.content); setDeletingId(null); }}
                                  className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                  title="编辑"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeletingId(item.id); setEditingId(null); }}
                                  className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                  title="删除"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* 编辑模式 */}
                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  className="w-full p-3 text-sm bg-white dark:bg-gray-700 border border-green-300 dark:border-green-600 rounded-lg text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-green-400/50"
                                  rows={4}
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); if (editingContent.trim()) { updateHistoryItem(item.id, editingContent.trim()); setEditingId(null); } }}
                                    disabled={!editingContent.trim()}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <CheckCircle size={12} />
                                    保存
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                  >
                                    <X size={12} />
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => { setShowHistory(false); navigate(`/inspiration/${item.domainId}`); }}
                                className="cursor-pointer"
                              >
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                  {item.content}
                                </p>
                              </div>
                            )}

                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                              {new Date(item.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </p>

                            {/* 删除确认 */}
                            <AnimatePresence>
                              {isDeleting && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                                >
                                  <p className="text-xs text-red-600 dark:text-red-400 mb-2">确定删除这条灵感吗？</p>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); removeFromHistory(item.id); setDeletingId(null); }}
                                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                                    >
                                      确认删除
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                                      className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                    >
                                      取消
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 底部统计 */}
                {history.length > 0 && (
                  <div className="px-6 py-3 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      共 <span className="font-bold text-green-600 dark:text-green-400">{history.length}</span> 条灵感记录
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </>
  );
}
