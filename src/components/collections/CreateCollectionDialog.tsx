/**
 * 创建/编辑集合对话框
 * 3步向导式创建流程
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { useCollections } from '@/hooks/useCollections';
import {
  COLLECTION_ICONS,
  COLLECTION_COLORS,
  CreateCollectionFormData,
} from '@/types/collections';

interface CreateCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId?: string; // 如果提供，则为编辑模式
  onSuccess?: () => void;
}

type Step = 1 | 2 | 3;

export function CreateCollectionDialog({
  isOpen,
  onClose,
  collectionId,
  onSuccess,
}: CreateCollectionDialogProps) {
  const { createCollection, updateCollection, collections } = useCollections();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateCollectionFormData>({
    name: '',
    description: '',
    icon: '📁',
    color: '#8B5CF6',
    questions: [],
  });

  // 如果是编辑模式，加载现有数据
  useEffect(() => {
    if (collectionId && isOpen) {
      const collection = collections.find(c => c.id === collectionId);
      if (collection) {
        setFormData({
          name: collection.name,
          description: collection.description || '',
          icon: collection.icon || '📁',
          color: collection.color || '#8B5CF6',
          questions: collection.questions || [],
        });
      }
    } else if (!collectionId && isOpen) {
      // 重置表单
      setFormData({
        name: '',
        description: '',
        icon: '📁',
        color: '#8B5CF6',
        questions: [],
      });
      setStep(1);
    }
  }, [collectionId, isOpen, collections]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入集合名称');
      return;
    }

    setLoading(true);
    try {
      if (collectionId) {
        // 编辑模式
        await updateCollection(collectionId, formData);
        toast.success('✅ 集合已更新');
      } else {
        // 创建模式
        await createCollection(formData);
        toast.success('✅ 集合创建成功');
      }
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      description: '',
      icon: '📁',
      color: '#8B5CF6',
      questions: [],
    });
    onClose();
  };

  const canGoNext = () => {
    if (step === 1) {
      return formData.name.trim().length > 0;
    }
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* 头部 */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {collectionId ? '编辑集合' : '创建集合'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="flex-1 flex items-center gap-2"
              >
                <div
                  className={`flex-1 h-2 rounded-full transition-all ${
                    s <= step ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
                {s < 3 && (
                  <ChevronRight
                    className={`w-4 h-4 ${
                      s < step ? 'text-purple-500' : 'text-gray-400'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 步骤标题 */}
          <div className="mt-4">
            {step === 1 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                第1步：设置集合的基本信息
              </p>
            )}
            {step === 2 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                第2步：从收藏中添加问题（可选）
              </p>
            )}
            {step === 3 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                第3步：确认并创建
              </p>
            )}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: 基本信息 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* 集合名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    集合名称 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="例如：职业探索、关系思考..."
                    fullWidth
                  />
                </div>

                {/* 描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    描述 <span className="text-gray-400">（可选）</span>
                  </label>
                  <TextArea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="简单描述这个集合的主题和目的..."
                    rows={3}
                    fullWidth
                  />
                </div>

                {/* 选择图标 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    选择图标
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {COLLECTION_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-12 h-12 text-2xl rounded-xl border-2 transition-all flex items-center justify-center ${
                          formData.icon === icon
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-110'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 选择颜色 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    选择主题色
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {COLLECTION_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-12 h-12 rounded-full border-4 transition-all ${
                          formData.color === color
                            ? 'border-gray-900 dark:border-white scale-110 shadow-lg'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: 添加问题 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    可以稍后添加问题
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    你可以在创建集合后，从收藏中添加问题
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    或者在浏览问题时直接添加到这个集合
                  </p>
                </div>

                {/* 已选择的问题数量 */}
                {(formData.questions?.length || 0) > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                        已选择 {formData.questions?.length || 0} 个问题
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('确定要清空已选择的问题吗？')) {
                            setFormData({ ...formData, questions: [] });
                          }
                        }}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        清空
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: 确认 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* 预览卡片 */}
                <div
                  className="p-6 rounded-2xl border-2 relative overflow-hidden"
                  style={{
                    backgroundColor: `${formData.color}10`,
                    borderColor: formData.color,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {formData.name || '未命名集合'}
                      </h3>
                      {formData.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {formData.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formData.questions?.length || 0} 个问题</span>
                        {(formData.questions?.length || 0) > 0 && (
                          <>
                            <span>•</span>
                            <span>准备就绪</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 提示信息 */}
                {formData.questions?.length || 0 === 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      💡 提示：创建后可以从收藏中添加问题，或者直接在浏览问题时添加到这个集合
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-2xl">
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="ghost"
                onClick={() => setStep((step - 1) as Step)}
                disabled={loading}
                className="flex-1"
              >
                <ChevronLeft size={18} className="mr-1" />
                上一步
              </Button>
            )}

            <div className="flex-1" />

            {step < 3 ? (
              <Button
                onClick={() => setStep((step + 1) as Step)}
                disabled={!canGoNext()}
                className="flex-1"
              >
                下一步
                <ChevronRight size={18} className="ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.name.trim()}
                isLoading={loading}
                className="flex-1"
              >
                {collectionId ? '保存修改' : '创建集合'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
