/**
 * 知识科普AI问答页面
 * 接入用户配置的AI大模型实现智能化问答
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageCircle, Send, Loader2, Sparkles, User, Bot, Settings } from 'lucide-react';
import { useRoundtableStore } from '@/stores/roundtableStore';
import { streamChat } from '@/services/llmService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `你是一个博学多才的知识科普助手，你的名字叫"万万助手"。你的专长领域包括：

1. **世界之最** - 各种世界纪录、极限数据、罕见现象
2. **系统思维** - 系统论、复杂性科学、反馈回路、涌现等概念
3. **健康管理** - 营养学、运动科学、心理健康、疾病预防

回答要求：
- 用通俗易懂的语言解释复杂概念
- 适当举例帮助理解
- 如果问题涉及多个方面，分点阐述
- 鼓励用户思考和探索
- 如果问题不在你的专长范围内，也尽力回答，并建议用户到相关模块深入了解`;

export function KnowledgeAIAskPage() {
  const navigate = useNavigate();
  const llmConfig = useRoundtableStore(state => state.llmConfig);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // 示例问题
  const exampleQuestions = [
    "什么是认知失调？",
    "为什么需要睡眠？",
    "混沌理论是什么？",
    "如何保持心血管健康？"
  ];

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || input;
    if (!messageContent.trim() || isLoading) return;

    // 检查是否配置了AI模型
    if (!llmConfig?.apiKey) {
      const tipMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ 还未配置 AI 模型哦！\n\n请先前往「圆桌会」页面，点击右上角设置按钮配置你的 AI 大模型（支持 DeepSeek、通义千问、智谱 GLM、Kimi、豆包等）。\n\n配置完成后即可享受智能问答体验！',
        timestamp: new Date()
      };
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg, tipMessage]);
      setInput('');
      return;
    }

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      // 构建对话上下文（保留最近10轮）
      const recentMessages = messages.slice(-10);
      const chatMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...recentMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })),
        { role: 'user' as const, content: messageContent }
      ];

      // 流式调用AI
      let fullContent = '';
      for await (const chunk of streamChat(chatMessages, llmConfig)) {
        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
        timestamp: new Date()
      };

      setStreamingContent('');
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '未知错误';
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `抱歉，AI 服务出现了问题：${errMsg}\n\n请检查你的 AI 模型配置是否正确（API Key 是否有效、网络是否正常）。`,
        timestamp: new Date()
      };
      setStreamingContent('');
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen noise-bg relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/bg-picture/bg-konwledge2.jpg')" }}>
      {/* 背景融合层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-emerald-50/85 to-teal-50/90 dark:from-gray-900/95 dark:via-green-900/90 dark:to-emerald-900/90" />
      <div className="relative z-10 min-h-screen">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/knowledge-popularize')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">返回</span>
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <MessageCircle size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent hidden sm:block">
                AI 问答
              </h1>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/roundtable/setup')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                llmConfig?.apiKey
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
              }`}
              title={llmConfig?.apiKey ? `当前模型：${llmConfig.model || '默认'}` : '未配置AI模型，点击前往配置'}
            >
              <Settings size={16} />
              <span className="hidden sm:inline">{llmConfig?.apiKey ? '已连接' : '未配置'}</span>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
          {/* 欢迎信息 */}
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="relative w-20 h-20 mx-auto mb-4 rounded-3xl shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/icon-picture/icon-knowledge1.jpg')" }} />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/80 to-emerald-500/80 flex items-center justify-center">
                  <Sparkles size={40} className="text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                智能知识问答
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                关于世界之最、系统思维、健康管理的任何问题，都可以问我
              </p>
              {!llmConfig?.apiKey && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <button
                    onClick={() => navigate('/roundtable/setup')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    <Settings size={16} />
                    点击配置 AI 模型，解锁智能问答
                  </button>
                </motion.div>
              )}

              {/* 示例问题 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {exampleQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSendMessage(question)}
                    className="relative p-4 rounded-xl border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 text-left transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" style={{ backgroundImage: "url('/UI-picture/UI-knowledge3.jpg')" }} />
                    <div className="relative z-10 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                      <Sparkles size={16} />
                      {question}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* 头像 */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-br from-green-500 to-emerald-500'
                    }`}>
                      {message.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                    </div>

                    {/* 消息内容 */}
                    <div className={`relative px-4 py-3 rounded-2xl overflow-hidden ${
                      message.role === 'user'
                        ? 'text-white border-2 border-blue-300/50 dark:border-blue-600/50'
                        : 'text-gray-800 dark:text-gray-200 border-2 border-green-200 dark:border-green-800'
                    }`}>
                      {message.role === 'user' ? (
                        <>
                          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/UI-picture/UI-knowledge2.jpg')" }} />
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/85 to-cyan-500/85 dark:from-blue-600/85 dark:to-cyan-600/85" />
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/UI-picture/UI-knowledge3.jpg')" }} />
                          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/85 backdrop-blur-sm" />
                        </>
                      )}
                      <p className="relative whitespace-pre-line leading-relaxed text-sm">
                        {message.content}
                      </p>
                      <div className={`relative text-xs mt-2 opacity-70 ${
                        message.role === 'user' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 流式输出中 */}
            {isLoading && streamingContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="relative px-4 py-3 rounded-2xl border-2 border-green-200 dark:border-green-800 text-gray-800 dark:text-gray-200 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/UI-picture/UI-knowledge3.jpg')" }} />
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/85 backdrop-blur-sm" />
                    <p className="relative whitespace-pre-line leading-relaxed text-sm">
                      {streamingContent}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 加载指示器（等待首个token） */}
            {isLoading && !streamingContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="relative px-4 py-3 rounded-2xl border-2 border-green-200 dark:border-green-800 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/UI-picture/UI-knowledge3.jpg')" }} />
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/85 backdrop-blur-sm" />
                    <div className="relative flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">正在思考...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="relative overflow-hidden rounded-2xl shadow-lg border-2 border-green-200 dark:border-green-800">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/UI-picture/UI-knowledge3.jpg')" }} />
            <div className="relative z-10 p-4 bg-white/80 dark:bg-gray-800/85 backdrop-blur-md">
              <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入你的问题...（按 Enter 发送，Shift + Enter 换行）"
                rows={1}
                className="flex-1 resize-none bg-gray-50 dark:bg-gray-700 border-0 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 max-h-32"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  isLoading || !input.trim()
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                }`}
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </motion.button>
            </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
