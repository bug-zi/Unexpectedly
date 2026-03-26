/**
 * 知识科普AI问答页面
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageCircle, Send, Loader2, Sparkles, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function KnowledgeAIAskPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      // 调用AI API获取回答
      const response = await fetchAIResponse(messageContent);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAIResponse = async (question: string): Promise<string> => {
    // 使用项目中的AI服务
    // 这里可以调用现有的AI API或使用简单的知识库匹配

    // 简单的关键词匹配回答（演示用）
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('认知失调')) {
      return '认知失调是指当人的信念与行为冲突时，会产生心理上的不适感，促使人改变信念或行为来缓解这种不适。这解释了为什么我们即使知道自己错了，也难以承认。理解认知失调有助于我们更客观地看待自己的决策和行为。';
    }

    if (lowerQuestion.includes('睡眠')) {
      return '睡眠对健康至关重要：\n\n1. **修复功能**：睡眠时身体修复受损细胞\n2. **记忆巩固**：大脑整理和巩固白天的记忆\n3. **情绪调节**：睡眠不足会影响情绪和判断力\n4. **免疫支持**：充足睡眠增强免疫系统\n\n成年人建议每天保持7-9小时的优质睡眠。';
    }

    if (lowerQuestion.includes('混沌理论') || lowerQuestion.includes('蝴蝶效应')) {
      return '混沌理论是研究复杂系统中微小变化如何引发巨大影响的学科。著名的"蝴蝶效应"就源于此理论：巴西的一只蝴蝶扇动翅膀，可能在德克萨斯引发龙卷风。\n\n关键启示：\n- 初始条件敏感依赖\n- 长期预测的困难性\n- 系统的不可预测性';
    }

    if (lowerQuestion.includes('心血管') || lowerQuestion.includes('心脏')) {
      return '保持心血管健康的重要建议：\n\n1. **定期检查血压**：维持健康血压（低于120/80）\n2. **规律运动**：每周至少150分钟中等强度有氧运动\n3. **健康饮食**：减少饱和脂肪和盐的摄入\n4. **戒烟限酒**：避免吸烟，限制酒精摄入\n5. **管理压力**：慢性压力会损害心血管健康\n\n高血压被称为"沉默杀手"，往往没有明显症状，定期体检非常重要！';
    }

    if (lowerQuestion.includes('系统思维')) {
      return '系统思维是一种从整体角度理解世界的思维方式：\n\n**核心要素**：\n1. **整体性**：看到各部分的相互联系\n2. **动态性**：理解系统随时间的变化\n3. **层次性**：认识系统的不同层次结构\n4. **反馈**：正反馈和负反馈调节系统\n\n**应用价值**：\n- 帮助理解复杂问题\n- 避免局部优化导致全局问题\n- 预见长期后果和副作用';
    }

    if (lowerQuestion.includes('马太效应')) {
      return '马太效应源于《圣经》中"马太福音"："凡有的，还要加给他；凡没有的，连他所有的也要夺走。"\n\n**社会学意义**：\n- 优势会累积，导致贫富差距越来越大\n- 资源分配不均会自我强化\n- 初始优势带来后续更多机会\n\n**启示**：\n- 理解社会不平等的机制\n- 设计政策时注意累积效应\n- 为弱势群体提供更多支持';
    }

    // 默认回答
    return `关于"${question}"，这是一个很好的问题！\n\n从我目前的知识库来看，这个问题涉及多个方面。建议你可以：\n\n1. 📚 **浏览相关模块**：在世界之最、系统思维、健康主理中寻找相关信息\n2. 🔍 **使用分类筛选**：系统思维模块支持按学科筛选\n3. 💡 **换个角度提问**：尝试更具体的问题\n\n如果你有更具体的问题，我很乐意为你解答！`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen noise-bg bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-green-200 dark:border-green-800">
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

            <div className="w-16" />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
          {/* 欢迎信息 */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-lg">
                <Sparkles size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                智能知识问答
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                关于世界之最、系统思维、健康管理的任何问题，都可以问我
              </p>

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
                    className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 text-left transition-all"
                  >
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
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
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-green-200 dark:border-green-800'
                    }`}>
                      <p className="whitespace-pre-line leading-relaxed text-sm">
                        {message.content}
                      </p>
                      <div className={`text-xs mt-2 opacity-70 ${
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

            {/* 加载指示器 */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-green-200 dark:border-green-800 p-4">
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
      </main>
    </div>
  );
}
