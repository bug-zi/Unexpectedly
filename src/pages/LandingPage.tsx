import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Brain, Lightbulb, Target, TrendingUp, Zap, AlertCircle, MessageCircle, Gamepad2 } from 'lucide-react';

/**
 * 万万没想到 Unexpectedly - 项目介绍页
 * 配色方案：琥珀色/黄色系，与项目整体风格一致
 */

export function LandingPage() {
  const [activeFact, setActiveFact] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 挑衅性事实轮播
  const facts = [
    { icon: <AlertCircle className="w-6 h-6" />, text: "你每天在手机上花4小时，但思考不到4分钟" },
    { icon: <MessageCircle className="w-6 h-6" />, text: "刷100条短视频 ≠ 真正学到1个知识" },
    { icon: <Brain className="w-6 h-6" />, text: "你的大脑需要深度思考，不是无限滚动" },
    { icon: <Zap className="w-6 h-6" />, text: "停下来思考5分钟，比忙碌1小时更有价值" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFact((prev) => (prev + 1) % facts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 特性卡片
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "别让大脑生锈",
      description: "5种思维维度 × 5种生活场景，像健身一样锻炼思维",
      color: "amber",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "灵感不是等出来的",
      description: "三个随机词语，强行打破你的思维惯性",
      color: "yellow",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "看见自己的成长",
      description: "不只是记录答案，而是追踪你的思维如何进化",
      color: "orange",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "每天5分钟",
      description: "养成思考习惯，比刷短视频强100倍",
      color: "red",
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "知识不是干货",
      description: "系统思维、健康管理，真正有用的认知工具",
      color: "amber",
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "你不是一个人在思考",
      description: "和其他深度思考者交流，别在信息茧房里打转",
      color: "yellow",
    }
  ];

  // 数据统计
  const stats = [
    { value: "1000+", label: "不是AI生成的", sublabel: "真人设计的深度问题", icon: <Target /> },
    { value: "25", label: "思维维度", sublabel: "覆盖你生活的方方面面", icon: <Brain /> },
    { value: "∞", label: "组合可能", sublabel: "永远有新的思考角度", icon: <Sparkles /> },
    { value: "0", label: "广告推送", sublabel: "专注纯粹，不抢注意力", icon: <AlertCircle /> }
  ];

  // 颜色映射
  const colorMap = {
    amber: {
      bg: 'bg-amber-500',
      from: 'from-amber-500',
      to: 'to-amber-600',
      light: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20'
    },
    yellow: {
      bg: 'bg-yellow-500',
      from: 'from-yellow-500',
      to: 'to-yellow-600',
      light: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20'
    },
    orange: {
      bg: 'bg-orange-500',
      from: 'from-orange-500',
      to: 'to-orange-600',
      light: 'bg-orange-500/10',
      text: 'text-orange-400',
      border: 'border-orange-500/20'
    },
    red: {
      bg: 'bg-red-500',
      from: 'from-red-500',
      to: 'to-red-600',
      light: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/20'
    }
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-orange-500/5 rounded-full blur-3xl" />
        </div>

        {/* 主要内容 */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧 - 品牌介绍 */}
            <div className="space-y-8">
              {/* 项目图标 + 标题 */}
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src="/favicon.png"
                      alt="万万没想到"
                      className="w-20 h-20 rounded-2xl shadow-2xl"
                    />
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 rounded-2xl opacity-50 blur-lg" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight">
                      <span className="block text-white">万万没想到</span>
                      <span className="block text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 mt-1">
                        Unexpectedly
                      </span>
                    </h1>
                    <p className="text-xl text-gray-400 mt-2">
                      每日思维提升工具
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-amber-300">别再假装你在学习了</span>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    每天
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400">
                      深度思考 5分钟
                    </span>
                  </h2>
                  <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
                    在这个信息爆炸的时代，<span className="text-amber-400 font-semibold">缺的不是知识</span>，
                    是<span className="text-amber-400 font-semibold">停下来思考</span>的能力
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    to="/questions"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
                  >
                    <span>开始思考</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <Link
                    to="/slot-machine"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-transparent text-white rounded-full font-bold text-lg border-2 border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>灵感老虎机</span>
                  </Link>
                </div>
              </div>

              {/* 项目截图展示 */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 rounded-3xl blur-2xl" />
                <img
                  src="/万万没想到.png"
                  alt="万万没想到应用界面"
                  className="relative rounded-2xl shadow-2xl border border-amber-500/20 w-full max-w-2xl"
                />
              </div>
            </div>

            {/* 右侧 - 挑衅性事实卡片 */}
            <div className="relative">
              <div className="sticky top-32">
                <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-amber-500/20 shadow-2xl">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`p-3 ${colorMap.amber.light} rounded-xl flex-shrink-0`}>
                      <div className={colorMap.amber.text}>
                        {facts[activeFact].icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-white leading-relaxed">
                        {facts[activeFact].text}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {facts.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 rounded-full transition-all ${
                          index === activeFact
                            ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 flex-1'
                            : 'bg-gray-700 flex-1'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="mt-6 text-sm text-gray-500 text-center">
                  ↑ 这些事实，你可能从来没注意过
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 滚动提示 */}
        <div className="absolute bottom-12 right-12">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <span>往下看</span>
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </section>

      {/* 特性展示 */}
      <section className="relative py-32 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="mb-20 text-center">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6">
              <span className="block text-white">不是</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400">
                又一个工具
              </span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-2xl mx-auto">
              是让你的大脑<span className="text-amber-400 font-semibold">真正工作</span>起来
            </p>
          </div>

          {/* 卡片网格 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 border ${colorMap[feature.color as keyof typeof colorMap].border}`}
              >
                {/* 背景 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[feature.color as keyof typeof colorMap].from} ${colorMap[feature.color as keyof typeof colorMap].to} opacity-90`} />

                <div className="relative z-10">
                  <div className="inline-flex p-3 bg-white/20 rounded-xl mb-6">
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-white/80 text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 数据展示 */}
      <section className="relative py-32 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-6">
              用数据
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400">
                说话
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-amber-500/20 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${colorMap.amber.light} rounded-xl flex-shrink-0`}>
                    <div className={colorMap.amber.text}>
                      {stat.icon}
                    </div>
                  </div>

                  <div className="flex-1 text-left">
                    <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-xl font-bold text-gray-300 mb-1">
                      {stat.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {stat.sublabel}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
              别让你的大脑
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400">
                变成信息的垃圾桶
              </span>
            </h2>

            <p className="text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              每天5分钟深度思考，比被信息流喂食1小时更有价值
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/questions"
                className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 text-white rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl"
              >
                <span>现在就开始</span>
                <ArrowRight className="w-6 h-6" />
              </Link>

              <p className="text-gray-500 text-sm">
                免费使用 • 无广告 • 数据安全
              </p>
            </div>

            <p className="mt-16 text-gray-600 text-base">
              如果你还是习惯刷短视频，那我们可能不适合你
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
