/**
 * 灵感源泉 - 领域详情页
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Copy, Bookmark, BookmarkCheck, ChevronRight, Zap, Anchor, Shuffle, Sparkles, AlertTriangle, Expand, Loader2 } from 'lucide-react';
import { getDomainById, DEPTH_CONFIG } from '@/constants/inspirationDomains';
import type { DepthLevel } from '@/constants/inspirationDomains';
import { useInspirationAI } from '@/hooks/useInspirationAI';
import { useInspirationStore } from '@/stores/inspirationStore';
import { usePageSEO } from '@/hooks/usePageSEO';

const DEPTH_ICONS: Record<string, React.ReactNode> = {
  Zap: <Zap size={16} />,
  Anchor: <Anchor size={16} />,
  Shuffle: <Shuffle size={16} />,
};

export function InspirationDomainPage() {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const domain = getDomainById(domainId || '');

  const addToHistory = useInspirationStore((state) => state.addToHistory);
  const toggleFavorite = useInspirationStore((state) => state.toggleFavorite);
  const historyForDomain = useInspirationStore((state) => state.getHistoryForDomain(domainId || ''));

  const [selectedSubcategory, setSelectedSubcategory] = useState(domain?.subcategories[0]?.id || '');
  const [depth, setDepth] = useState<DepthLevel>('spark');
  const [generatedContent, setGeneratedContent] = useState('');
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const { generate, expand, isConfigured } = useInspirationAI({
    onStreaming: (text) => {
      setGeneratedContent(text);
    },
  });

  // SEO
  const { SEORender } = usePageSEO({
    seo: domain
      ? {
          title: `万万没想到 - ${domain.name}灵感，AI生成不重样创意`,
          description: `${domain.description}。AI为你生成${domain.name}领域的独特灵感，每次都不重样。`,
          keywords: [domain.name, '灵感生成', 'AI创意', '思维激发'],
        }
      : '/inspiration',
  });

  // 页面加载时设置默认子类别
  useEffect(() => {
    if (domain && domain.subcategories.length > 0) {
      setSelectedSubcategory(domain.subcategories[0].id);
    }
  }, [domain]);

  const handleGenerate = useCallback(async () => {
    if (!domain || !selectedSubcategory || isGenerating) return;

    setIsGenerating(true);
    setGeneratedContent('');
    setCurrentItemId(null);

    const result = await generate(domain.id, selectedSubcategory, depth);

    if (result) {
      const itemId = addToHistory({
        domainId: domain.id,
        subcategoryId: selectedSubcategory,
        depth,
        content: result,
        isFavorite: false,
      });
      setCurrentItemId(itemId);
      setGeneratedContent(result);

      // 滚动到结果
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    setIsGenerating(false);
  }, [domain, selectedSubcategory, depth, isGenerating, generate, addToHistory]);

  const handleExpand = useCallback(async () => {
    if (!domain || !generatedContent || isExpanding) return;

    setIsExpanding(true);
    const result = await expand(generatedContent, domain.id);

    if (result) {
      // 更新历史记录中的内容
      const itemId = addToHistory({
        domainId: domain.id,
        subcategoryId: selectedSubcategory,
        depth,
        content: result,
        isFavorite: false,
      });
      setCurrentItemId(itemId);
      setGeneratedContent(result);
    }

    setIsExpanding(false);
  }, [domain, generatedContent, isExpanding, expand, addToHistory, selectedSubcategory, depth]);

  const handleCopy = useCallback(async () => {
    if (!generatedContent) return;
    try {
      await navigator.clipboard.writeText(generatedContent);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [generatedContent]);

  const handleToggleFavorite = useCallback(() => {
    if (currentItemId) {
      toggleFavorite(currentItemId);
    }
  }, [currentItemId, toggleFavorite]);

  // 无效域名
  if (!domain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">找不到该灵感领域</p>
          <button
            onClick={() => navigate('/inspiration')}
            className="px-4 py-2 bg-green-500 text-white rounded-xl"
          >
            返回灵感中心
          </button>
        </div>
      </div>
    );
  }

  const subcategory = domain.subcategories.find((s) => s.id === selectedSubcategory);
  const currentItem = currentItemId ? useInspirationStore.getState().history.find((i) => i.id === currentItemId) : null;
  const isFavorited = currentItem?.isFavorite ?? false;

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

        <div className="relative z-10 max-w-3xl mx-auto px-4 py-6">
          {/* 导航栏 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <button
              onClick={() => navigate('/inspiration')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">灵感中心</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Sparkles size={16} />
              {domain.name}
            </div>
          </motion.div>

          {/* 领域标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {domain.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{domain.description}</p>
          </motion.div>

          {/* AI 未配置警告 */}
          {!isConfigured && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3"
            >
              <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-amber-700 dark:text-amber-300 font-medium text-sm">请先配置 AI 模型</p>
              </div>
              <button
                onClick={() => navigate('/roundtable/setup')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                去配置
              </button>
            </motion.div>
          )}

          {/* 子类别选择 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">选择方向</p>
            <div className="flex flex-wrap gap-2">
              {domain.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    selectedSubcategory === sub.id
                      ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 text-white shadow-md shadow-green-300/40'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
            {subcategory && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{subcategory.description}</p>
            )}
          </motion.div>

          {/* 深度选择器 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">生成深度</p>
            <div className="flex gap-2">
              {(Object.entries(DEPTH_CONFIG) as [DepthLevel, typeof DEPTH_CONFIG[DepthLevel]][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setDepth(key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      depth === key
                        ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 text-white shadow-md shadow-green-300/40'
                        : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                    }`}
                  >
                    {DEPTH_ICONS[config.icon]}
                    {config.name}
                  </button>
                )
              )}
            </div>
          </motion.div>

          {/* 生成按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating || !isConfigured}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all relative overflow-hidden ${
                isGenerating || !isConfigured
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-400 text-white shadow-lg shadow-green-400/30 hover:shadow-xl hover:shadow-green-400/40'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  灵感涌现中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={20} />
                  生成灵感
                </span>
              )}
              {/* 生成中脉冲效果 */}
              {isGenerating && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400/30 via-emerald-400/30 to-teal-300/30"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
          </motion.div>

          {/* 结果展示 */}
          <AnimatePresence mode="wait">
            {(generatedContent || isGenerating) && (
              <motion.div
                ref={resultRef}
                key={currentItemId || 'generating'}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
                  {/* 结果头部标签 */}
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                        {domain.name}
                      </span>
                      {subcategory && (
                        <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                          {subcategory.name}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full">
                        {DEPTH_CONFIG[depth].name}
                      </span>
                    </div>
                  </div>

                  {/* 结果内容 */}
                  <div className="px-5 py-6">
                    <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-[15px]">
                      {generatedContent || '灵感正在涌现...'}
                      {isGenerating && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-block w-0.5 h-5 bg-green-500 ml-0.5 align-middle"
                        />
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  {!isGenerating && generatedContent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 flex-wrap"
                    >
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                      >
                        <RefreshCw size={14} />
                        重新生成
                      </button>
                      <button
                        onClick={handleExpand}
                        disabled={isExpanding}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        {isExpanding ? <Loader2 size={14} className="animate-spin" /> : <Expand size={14} />}
                        展开深入
                      </button>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors"
                      >
                        <Copy size={14} />
                        {showCopied ? '已复制' : '复制'}
                      </button>
                      <button
                        onClick={handleToggleFavorite}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                      >
                        {isFavorited ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                        {isFavorited ? '已收藏' : '收藏'}
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 历史灵感 */}
          {historyForDomain.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium mb-3 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <ChevronRight
                  size={18}
                  className={`transition-transform ${showHistory ? 'rotate-90' : ''}`}
                />
                历史灵感 ({historyForDomain.length})
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {historyForDomain
                      .filter((item) => item.id !== currentItemId)
                      .map((item) => {
                        const sub = domain.subcategories.find((s) => s.id === item.subcategoryId);
                        return (
                          <div
                            key={item.id}
                            className="p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/30 dark:border-gray-700/30"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {sub && (
                                <span className="text-xs px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                                  {sub.name}
                                </span>
                              )}
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {DEPTH_CONFIG[item.depth].name}
                              </span>
                              {item.isFavorite && (
                                <BookmarkCheck size={12} className="text-amber-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                              {item.content}
                            </p>
                            <button
                              onClick={() => {
                                setGeneratedContent(item.content);
                                setCurrentItemId(item.id);
                                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }}
                              className="mt-2 text-xs text-green-600 dark:text-green-400 hover:underline"
                            >
                              查看完整内容
                            </button>
                          </div>
                        );
                      })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
