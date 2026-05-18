/**
 * 灵感扩散器 - 词语笔记本面板
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Loader2, Trash2, BookOpen } from 'lucide-react';
import { useDiffuserStore } from '@/stores/diffuserStore';
import { useDiffuserNoteAI } from '@/hooks/useDiffuserNoteAI';
import DiffuserNoteItem from './DiffuserNoteItem';

interface DiffuserNotebookProps {
  isOpen: boolean;
  nodeId: string | null;
  word: string;
  onClose: () => void;
}

export default function DiffuserNotebook({ isOpen, nodeId, word, onClose }: DiffuserNotebookProps) {
  const [noteText, setNoteText] = useState('');
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const nodes = useDiffuserStore((s) => s.nodes);
  const addNote = useDiffuserStore((s) => s.addNote);
  const removeNote = useDiffuserStore((s) => s.removeNote);
  const updateNote = useDiffuserStore((s) => s.updateNote);
  const { generateNoteIdeas, isConfigured } = useDiffuserNoteAI();

  const node = nodeId ? nodes.find((n) => n.id === nodeId) : null;
  const notes = node?.notes ?? [];

  const handleAddNote = useCallback(() => {
    const trimmed = noteText.trim();
    if (!trimmed || !nodeId) return;
    addNote(nodeId, { content: trimmed, source: 'user' });
    setNoteText('');
  }, [noteText, nodeId, addNote]);

  const handleGenerateAI = useCallback(async () => {
    if (!nodeId || isGenerating) return;
    setIsGenerating(true);
    setAiIdeas([]);
    try {
      const existingContents = notes.map((n) => n.content);
      const ideas = await generateNoteIdeas(word, existingContents);
      setAiIdeas(ideas);
    } finally {
      setIsGenerating(false);
    }
  }, [nodeId, word, notes, generateNoteIdeas, isGenerating]);

  const handleAdoptIdea = useCallback((idea: string) => {
    if (!nodeId) return;
    addNote(nodeId, { content: idea, source: 'ai' });
    setAiIdeas((prev) => prev.filter((i) => i !== idea));
  }, [nodeId, addNote]);

  const handleDeleteNote = useCallback((noteId: string) => {
    if (!nodeId) return;
    removeNote(nodeId, noteId);
  }, [nodeId, removeNote]);

  const handleEditNote = useCallback((noteId: string, content: string) => {
    if (!nodeId) return;
    updateNote(nodeId, noteId, content);
  }, [nodeId, updateNote]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* 面板 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 flex flex-col bg-white/95 backdrop-blur-md border-l border-green-200/30 shadow-xl"
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-green-100/50">
              <h3 className="text-base font-semibold text-green-800 flex items-center gap-2">
                <BookOpen size={18} className="text-green-600" />
                笔记本 · <span className="text-green-600">{word}</span>
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* 笔记内容区域 */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {/* 输入框 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddNote();
                  }}
                  placeholder="写下你的想法..."
                  className="flex-1 text-sm bg-white/70 border border-green-200/60 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-300/50 focus:border-green-400 placeholder:text-gray-400 transition-all"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <Send size={14} />
                </button>
              </div>

              {/* AI 想法区域 */}
              {isConfigured && (
                <div className="space-y-2">
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium bg-green-50/80 text-green-700 border border-green-200/60 hover:bg-green-100/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        生成 AI 想法
                      </>
                    )}
                  </button>

                  {/* AI 建议列表 */}
                  <AnimatePresence>
                    {aiIdeas.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5 overflow-hidden"
                      >
                        <div className="flex items-center justify-between pl-1">
                          <p className="text-xs text-green-600/70">点击采纳想法：</p>
                          <button
                            onClick={() => setAiIdeas([])}
                            className="text-xs text-green-500/60 hover:text-green-600 transition-colors flex items-center gap-0.5"
                          >
                            <Trash2 size={10} />
                            清除剩余
                          </button>
                        </div>
                        {aiIdeas.map((idea, i) => (
                          <motion.button
                            key={`${idea}-${i}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleAdoptIdea(idea)}
                            className="w-full text-left p-2.5 rounded-lg text-sm bg-green-50/60 text-green-800 border border-green-200/40 hover:bg-green-100/70 hover:border-green-300/60 transition-all"
                          >
                            ✨ {idea}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* 笔记列表 */}
              <div className="space-y-2">
                {notes.length === 0 && !isGenerating && (
                  <p className="text-center text-gray-400 text-xs py-6">
                    还没有笔记，写下你的想法吧
                  </p>
                )}
                <AnimatePresence>
                  {notes.map((note) => (
                    <DiffuserNoteItem
                      key={note.id}
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* 底部统计 */}
            {notes.length > 0 && (
              <div className="px-4 py-2 border-t border-green-100/50 text-xs text-gray-400 text-center">
                共 {notes.length} 条笔记
                {notes.filter((n) => n.source === 'ai').length > 0 &&
                  ` · AI ${notes.filter((n) => n.source === 'ai').length} 条`}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
