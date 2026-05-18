/**
 * 灵感扩散器 - 笔记条目组件
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Check, X, Sparkles, User } from 'lucide-react';
import type { DiffuserNote } from '@/types/diffuser';

interface DiffuserNoteItemProps {
  note: DiffuserNote;
  onEdit: (noteId: string, content: string) => void;
  onDelete: (noteId: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

export default function DiffuserNoteItem({ note, onEdit, onDelete }: DiffuserNoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== note.content) {
      onEdit(note.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  const isAi = note.source === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`group rounded-lg p-3 text-sm transition-colors ${
        isAi
          ? 'bg-green-50/70 border border-green-200/50'
          : 'bg-emerald-50/60 border border-emerald-300/50'
      }`}
    >
      {/* 来源标识 + 时间 */}
      <div className="flex items-center justify-between mb-1.5">
        <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${
          isAi
            ? 'bg-green-100/80 text-green-700'
            : 'bg-emerald-200/70 text-emerald-800'
        }`}>
          {isAi ? <Sparkles size={10} /> : <User size={10} />}
          {isAi ? 'AI 想法' : '我的笔记'}
        </span>
        <span className="text-xs text-gray-400">{formatRelativeTime(note.createdAt)}</span>
      </div>

      {/* 内容 */}
      {isEditing ? (
        <div className="flex gap-1.5">
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="flex-1 text-sm bg-white/80 border border-green-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-green-400"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:text-green-700 transition-colors"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <p className="text-gray-700 leading-relaxed break-words">{note.content}</p>
      )}

      {/* 操作按钮 */}
      {!isEditing && !confirmDelete && (
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="编辑"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="删除"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* 删除确认 */}
      {confirmDelete && (
        <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
          <span>确认删除？</span>
          <button
            onClick={() => onDelete(note.id)}
            className="px-2 py-0.5 bg-red-500/80 text-white rounded hover:bg-red-600 transition-colors"
          >
            删除
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-2 py-0.5 bg-gray-200/80 text-gray-600 rounded hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
        </div>
      )}
    </motion.div>
  );
}
