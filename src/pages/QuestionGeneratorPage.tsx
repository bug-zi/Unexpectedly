import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Sparkles, Check, Wand2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Question } from '@/types';
import { THINKING_DIMENSIONS, LIFE_SCENARIOS } from '@/constants/categories';
import { generateQuestionsWithAI, optimizeQuestionWithAI } from '@/utils/aiQuestionGenerator';
import { CategoryIcon } from '@/components/ui/Icon';

export function QuestionGeneratorPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    content: '',
    category: '',
    difficulty: 3 as 1 | 2 | 3 | 4 | 5,
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [aiKeywords, setAiKeywords] = useState('');
  const [categoryType, setCategoryType] = useState<'thinking' | 'scenario'>('thinking');

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async () => {
    if (!formData.content.trim() || !formData.category) {
      alert('请填写问题内容并选择分类');
      return;
    }

    setIsSubmitting(true);

    // 创建新问题
    const newQuestion: Question = {
      id: `custom-${crypto.randomUUID()}`,
      category: {
        primary: 'thinking',
        secondary: formData.category as any,
      },
      content: formData.content.trim(),
      difficulty: formData.difficulty,
      tags: formData.tags,
      createdAt: new Date(),
      answerCount: 0,
    };

    // 保存到本地存储（实际应用中应该发送到服务器审核）
    try {
      // 这里暂时保存到localStorage，标记为待审核
      const pendingQuestions = JSON.parse(
        localStorage.getItem('wwx-pending-questions') || '[]'
      );
      pendingQuestions.push(newQuestion);
      localStorage.setItem('wwx-pending-questions', JSON.stringify(pendingQuestions));

      setIsSubmitting(false);
      setShowSuccess(true);

      // 3秒后返回首页
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('保存失败:', error);
      setIsSubmitting(false);
      alert('保存失败，请重试');
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.category) {
      alert(`请先选择${categoryType === 'thinking' ? '思维维度' : '生活场景'}`);
      return;
    }

    setIsGeneratingWithAI(true);

    try {
      const keywords = aiKeywords.trim() ? aiKeywords.split(',').map(k => k.trim()) : [];
      // 对于生活场景的creative，需要添加scenario-前缀以区分思维维度的creative
      const apiCategory = categoryType === 'scenario' && formData.category === 'creative'
        ? 'scenario-creative'
        : formData.category;

      const generated = await generateQuestionsWithAI({
        category: apiCategory,
        difficulty: formData.difficulty,
        count: 1,
        keywords,
      });

      if (generated.length > 0) {
        const question = generated[0];
        setFormData({
          ...formData,
          content: question.content,
          tags: question.suggestedTags.slice(0, 5),
        });
      }

      setIsGeneratingWithAI(false);
    } catch (error) {
      console.error('AI生成失败:', error);
      setIsGeneratingWithAI(false);
      alert(`AI生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleAIOptimize = async () => {
    if (!formData.content.trim()) {
      alert('请先输入问题内容');
      return;
    }

    setIsGeneratingWithAI(true);

    try {
      const optimized = await optimizeQuestionWithAI(formData.content);
      setFormData({
        ...formData,
        content: optimized,
      });
      setIsGeneratingWithAI(false);
    } catch (error) {
      console.error('AI优化失败:', error);
      setIsGeneratingWithAI(false);
      alert(`AI优化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const difficulties: Array<{ value: number; label: string; stars: string }> = [
    { value: 1, label: '很简单', stars: '⭐' },
    { value: 2, label: '简单', stars: '⭐⭐' },
    { value: 3, label: '中等', stars: '⭐⭐⭐' },
    { value: 4, label: '困难', stars: '⭐⭐⭐⭐' },
    { value: 5, label: '很困难', stars: '⭐⭐⭐⭐⭐' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/questions/explore')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
            <div className="flex items-center gap-2">
              <Sparkles size={24} className="text-amber-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                问题生成器
              </h1>
            </div>
            <div className="w-16" />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Check size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                提交成功！
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                你的问题已提交，审核通过后将显示在问题库中
              </p>
            </motion.div>
          ) : (
            <>
              {/* 页面标题 */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ✨ 创建你的问题
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  设计一个能激发思考的问题，分享给更多人
                </p>
              </motion.div>

              {/* 问题编辑器 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 md:p-8">
                  {/* 问题内容 */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        问题内容 *
                      </label>
                      <div className="flex gap-2">
                        {formData.content && (
                          <Button
                            type="button"
                            onClick={handleAIOptimize}
                            variant="ghost"
                            size="sm"
                            disabled={isGeneratingWithAI}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <RefreshCw size={16} className="mr-1" />
                            AI优化
                          </Button>
                        )}
                      </div>
                    </div>
                    <TextArea
                      placeholder="例如：如果可以在任何地方生活，你会选择哪里？为什么？"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      fullWidth
                      rows={4}
                      className="text-lg"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.content.length} / 200 字
                      </p>
                      {isGeneratingWithAI && (
                        <span className="text-sm text-purple-600 dark:text-purple-400">
                          AI正在思考中...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 分类选择 */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        分类选择 *
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCategoryType('thinking');
                            setFormData({ ...formData, category: '' });
                          }}
                          className={`px-3 py-1 text-sm rounded-lg transition-all ${
                            categoryType === 'thinking'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          思维维度
                        </button>
                        <button
                          onClick={() => {
                            setCategoryType('scenario');
                            setFormData({ ...formData, category: '' });
                          }}
                          className={`px-3 py-1 text-sm rounded-lg transition-all ${
                            categoryType === 'scenario'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          生活场景
                        </button>
                      </div>
                    </div>

                    {categoryType === 'thinking' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                        {Object.values(THINKING_DIMENSIONS).map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setFormData({ ...formData, category: category.id })}
                            className={`p-2 md:p-3 lg:p-4 rounded-xl border-2 transition-all ${
                              formData.category === category.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex justify-center mb-1 md:mb-2">
                              <CategoryIcon
                                iconName={category.iconName || category.icon}
                                color={formData.category === category.id ? category.dark : category.color}
                                size={24}
                              />
                            </div>
                            <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white leading-tight">
                              {category.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                        {Object.values(LIFE_SCENARIOS).map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setFormData({ ...formData, category: category.id })}
                            className={`p-2 md:p-3 lg:p-4 rounded-xl border-2 transition-all ${
                              formData.category === category.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex justify-center mb-1 md:mb-2">
                              <CategoryIcon
                                iconName={category.iconName || category.icon}
                                color={formData.category === category.id ? category.dark : category.color}
                                size={24}
                              />
                            </div>
                            <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white leading-tight">
                              {category.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI智能生成 */}
                  <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Wand2 size={20} className="text-purple-600 dark:text-purple-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        AI 智能生成
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      根据你选择的{categoryType === 'thinking' ? '思维维度' : '生活场景'}和难度，让AI帮你生成高质量问题
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        type="text"
                        placeholder="可选：输入关键词，用逗号分隔（如：梦想,挑战,成长）"
                        value={aiKeywords}
                        onChange={(e) => setAiKeywords(e.target.value)}
                        className="flex-1"
                        disabled={isGeneratingWithAI}
                      />
                      <Button
                        type="button"
                        onClick={handleAIGenerate}
                        disabled={!formData.category || isGeneratingWithAI}
                        isLoading={isGeneratingWithAI}
                        variant="primary"
                        className="whitespace-nowrap"
                      >
                        <Sparkles size={18} className="mr-2" />
                        {isGeneratingWithAI ? 'AI生成中...' : 'AI生成问题'}
                      </Button>
                    </div>
                  </div>

                  {/* 难度选择 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      难度等级
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {difficulties.map((diff) => (
                        <button
                          key={diff.value}
                          onClick={() => setFormData({ ...formData, difficulty: diff.value as any })}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            formData.difficulty === diff.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <span className="mr-2">{diff.stars}</span>
                          <span className="text-sm">{diff.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 标签 */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      标签（最多5个）
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-primary-900 dark:hover:text-primary-100"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="添加标签..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        variant="secondary"
                        size="sm"
                      >
                        <Plus size={18} />
                      </Button>
                    </div>
                  </div>

                  {/* 提示信息 */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      💡 问题设计技巧
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                      <li>• 使用开放式问题，避免是非题</li>
                      <li>• 问题应该有启发性，能引发深入思考</li>
                      <li>• 避免引导性，保持中立</li>
                      <li>• 长度适中，20-50字为佳</li>
                      <li>• 可以留有想象空间，让读者自行发挥</li>
                    </ul>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/')}
                      className="flex-1"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!formData.content.trim() || !formData.category || isSubmitting}
                      isLoading={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? '提交中...' : '提交审核'}
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* 优秀问题示例 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    📚 优秀问题示例
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🔮</span>
                        <span className="font-semibold text-sm">假设思维</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        "如果你可以拥有任何一项超能力，但只能用来帮助他人，你会选择什么？"
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">💡</span>
                        <span className="font-semibold text-sm">自我反思</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        "你在什么情况下最有创造力？是什么激发了你的灵感？"
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🔗</span>
                        <span className="font-semibold text-sm">联想创意</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        "森林 + 数据 = ？这两种看似无关的事物如何结合？"
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
