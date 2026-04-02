import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Clock,
  Check,
  X,
  Sparkles,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useNotificationReminder } from '@/hooks/useNotificationReminder';
import { getNotificationDiagnostics } from '@/utils/notifications';

export function NotificationSettingsPage() {
  const navigate = useNavigate();
  const {
    settings,
    permission,
    isLoading,
    nextReminderIn,
    isEnabled,
    reminderTime,
    formattedTime,
    requestPermission,
    enableNotifications,
    disableNotifications,
    updateReminderTime,
    testNotification,
    parseTime,
    getDebugInfo,
    forceSendReminder,
    clearSentMark,
  } = useNotificationReminder();

  const [timeInput, setTimeInput] = useState(formattedTime);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const diagnostics = getNotificationDiagnostics();

  // 处理启用提醒
  const handleEnable = async () => {
    setErrorMessage('');
    setIsRequestingPermission(true);
    try {
      const time = parseTime(timeInput);
      await enableNotifications(time);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '启用失败，请重试');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // 处理禁用提醒
  const handleDisable = () => {
    disableNotifications();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // 处理保存时间
  const handleSaveTime = () => {
    try {
      const time = parseTime(timeInput);
      updateReminderTime(time);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage('时间格式错误，请使用 HH:MM 格式');
    }
  };

  // 处理测试通知
  const handleTestNotification = () => {
    setErrorMessage('');
    console.log('准备发送测试通知...');
    console.log('当前权限:', permission);

    if (permission !== 'granted') {
      setErrorMessage('请先授权通知权限');
      return;
    }

    try {
      // 直接在这里发送，不通过testNotification函数
      const { Notification } = window;
      if (!Notification) {
        setErrorMessage('浏览器不支持通知功能');
        return;
      }

      console.log('创建通知对象...');
      const notification = new Notification('🔔 测试通知', {
        body: '这是测试通知，如果你看到这条消息，说明通知功能正常！',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'wwx-test-notification',
        requireInteraction: true, // 需要用户交互才能关闭
      });

      console.log('通知已创建:', notification);

      // 点击通知时的处理
      notification.onclick = () => {
        window.focus();
        console.log('通知被点击');
        notification.close();
      };

      // 自动关闭
      setTimeout(() => {
        console.log('自动关闭通知');
        notification.close();
      }, 10000);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('发送测试通知失败:', error);
      setErrorMessage(error instanceof Error ? error.message : '发送测试通知失败');
    }
  };

  // 格式化剩余时间
  const formatTimeRemaining = (ms: number): string => {
    if (ms < 0) return '未启用';

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}天${hours % 24}小时`;
    }

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }

    return `${minutes}分钟`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg-picture/bg-index.jpg)' }}
      />
      {/* 半透明渐变遮罩 - 顶部更实，底部自然过渡 */}
      <div className="fixed inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.55) 100%)' }} />
      <div className="hidden dark:block fixed inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,41,0.75) 0%, rgba(15,23,41,0.55) 20%, rgba(15,23,41,0.4) 50%, rgba(15,23,41,0.6) 100%)' }} />
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 shadow-none">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
            <div className="flex items-center gap-2">
              <Bell size={24} className="text-purple-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                每日提醒
              </h1>
            </div>
            <div className="w-16" />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔔 每日提醒设置
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              固定时间收到思考提醒，养成每日思考习惯
            </p>
          </motion.div>

          {/* 成功提示 */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 flex items-center gap-3"
            >
              <Check size={20} className="text-green-500" />
              <span className="text-green-700 dark:text-green-300 font-medium">
                {isEnabled ? '设置已保存' : '已关闭每日提醒'}
              </span>
            </motion.div>
          )}

          {/* 错误提示 */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3"
            >
              <AlertCircle size={20} className="text-red-500" />
              <span className="text-red-700 dark:text-red-300">{errorMessage}</span>
              <button
                onClick={() => setErrorMessage('')}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}

          {/* 权限状态卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    通知权限
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {permission === 'granted' && '已授权，可以接收通知'}
                    {permission === 'denied' && '已拒绝，请在浏览器设置中允许通知'}
                    {permission === 'default' && '未授权，需要授权才能使用提醒功能'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {permission === 'granted' ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                      <Check size={18} />
                      <span className="text-sm font-medium">已授权</span>
                    </div>
                  ) : permission === 'denied' ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                      <X size={18} />
                      <div className="text-left">
                        <span className="text-sm font-medium block">已拒绝</span>
                        <span className="text-xs opacity-75">请在浏览器设置中允许通知</span>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={async () => {
                        setErrorMessage('');
                        setIsRequestingPermission(true);
                        try {
                          const result = await requestPermission();
                          if (result !== 'granted') {
                            setErrorMessage('请允许通知权限以使用每日提醒功能');
                          }
                        } catch (error) {
                          setErrorMessage(error instanceof Error ? error.message : '授权失败');
                        } finally {
                          setIsRequestingPermission(false);
                        }
                      }}
                      variant="primary"
                      size="sm"
                      disabled={isRequestingPermission}
                      isLoading={isRequestingPermission}
                    >
                      {isRequestingPermission ? '授权中...' : '授权通知'}
                    </Button>
                  )}
                </div>
              </div>

              {/* 诊断信息 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Info size={16} />
                  <span>查看诊断信息</span>
                  <span className="text-xs">{showDiagnostics ? '▲' : '▼'}</span>
                </button>

                {showDiagnostics && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">浏览器支持:</span>
                      <span className={diagnostics.supported ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {diagnostics.supported ? '✓ 支持' : '✗ 不支持'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">当前权限:</span>
                      <span className={`font-medium ${
                        diagnostics.permission === 'granted' ? 'text-green-600 dark:text-green-400' :
                        diagnostics.permission === 'denied' ? 'text-red-600 dark:text-red-400' :
                        'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {diagnostics.permission === 'granted' ? '已授权' :
                         diagnostics.permission === 'denied' ? '已拒绝' : '未授权'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">安全环境:</span>
                      <span className={diagnostics.secureContext ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {diagnostics.secureContext ? '✓ HTTPS/localhost' : '✗ 非安全环境'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">协议:</span>
                      <span className="text-gray-900 dark:text-white font-mono text-xs">
                        {diagnostics.protocol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">主机:</span>
                      <span className="text-gray-900 dark:text-white font-mono text-xs">
                        {diagnostics.hostname}
                      </span>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>诊断结果:</strong> {diagnostics.reason}
                      </p>
                    </div>

                    {/* 系统通知检查提示 */}
                    {diagnostics.permission === 'granted' && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium mb-2">
                          ⚠️ 授权成功但看不到通知？
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">
                          请检查以下几点：
                        </p>
                        <ol className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1 list-decimal list-inside">
                          <li>Windows: 设置 → 系统 → 通知和操作 → 确保通知已开启</li>
                          <li>Mac: 系统偏好设置 → 通知 → 浏览器 → 允许通知</li>
                          <li>检查浏览器设置：地址栏输入 chrome://settings/notifications (Chrome)</li>
                          <li>查看电脑是否有"请勿打扰"模式开启</li>
                          <li>点击测试通知后，查看系统托盘是否有通知图标</li>
                        </ol>
                      </div>
                    )}

                    {!diagnostics.canRequest && diagnostics.permission === 'denied' && (
                      <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                        <p className="text-sm text-orange-800 dark:text-orange-300 mb-2">
                          <strong>如何重置权限:</strong>
                        </p>
                        <ol className="text-xs text-orange-700 dark:text-orange-400 space-y-1 list-decimal list-inside">
                          <li>点击浏览器地址栏左侧的锁图标</li>
                          <li>找到"通知"或"网站设置"</li>
                          <li>将通知权限改为"允许"</li>
                          <li>刷新页面后重新点击"授权通知"</li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* 提醒设置卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                {isEnabled ? (
                  <Bell className="text-purple-500" size={24} />
                ) : (
                  <BellOff className="text-gray-400" size={24} />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    每日提醒
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isEnabled ? '已启用' : '已关闭'}
                  </p>
                </div>
              </div>

              {/* 时间设置 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  提醒时间
                </label>
                <div className="flex gap-3">
                  <input
                    type="time"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={!isEnabled}
                  />
                  {isEnabled && (
                    <Button
                      onClick={handleSaveTime}
                      variant="secondary"
                      size="sm"
                    >
                      保存时间
                    </Button>
                  )}
                </div>
              </div>

              {/* 下次提醒时间 */}
              {isEnabled && nextReminderIn >= 0 && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={18} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      距离下次提醒
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-200">
                    {formatTimeRemaining(nextReminderIn)}
                  </p>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3">
                {!isEnabled ? (
                  <>
                    <Button
                      onClick={handleEnable}
                      variant="primary"
                      fullWidth
                      disabled={permission !== 'granted' || isRequestingPermission}
                      isLoading={isRequestingPermission}
                    >
                      <Sparkles size={18} className="mr-2" />
                      {permission === 'granted' ? '启用每日提醒' : '请先授权通知'}
                    </Button>
                    {permission !== 'granted' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center w-full">
                        点击上方的"授权通知"按钮后即可启用
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleTestNotification}
                      variant="secondary"
                      className="flex-1"
                    >
                      测试通知
                    </Button>
                    <Button
                      onClick={handleDisable}
                      variant="danger"
                      className="flex-1"
                    >
                      关闭提醒
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </motion.div>

          {/* 说明卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                💡 使用说明
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• 启用后，将在每天设定的时间收到思考提醒</li>
                <li>• 点击通知可直接打开应用开始思考</li>
                <li>• 建议设置在固定时间，养成思考习惯</li>
                <li>• 如需更改时间，修改后点击"保存时间"即可</li>
                <li>• 可以随时点击"测试通知"验证功能是否正常</li>
              </ul>
            </Card>
          </motion.div>

          {/* 调试工具卡片 */}
          {isEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    🔍 调试工具
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const info = getDebugInfo();
                        setDebugInfo(info);
                        console.log('调试信息:', info);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      检查状态
                    </Button>
                    <Button
                      onClick={() => {
                        try {
                          forceSendReminder();
                          setShowSuccess(true);
                          setTimeout(() => setShowSuccess(false), 2000);
                        } catch (error) {
                          setErrorMessage(error instanceof Error ? error.message : '发送失败');
                        }
                      }}
                      variant="primary"
                      size="sm"
                    >
                      模拟提醒
                    </Button>
                    <Button
                      onClick={() => {
                        clearSentMark();
                        const info = getDebugInfo();
                        setDebugInfo(info);
                        setShowSuccess(true);
                        setTimeout(() => setShowSuccess(false), 2000);
                      }}
                      variant="secondary"
                      size="sm"
                      title="清除今天已发送的标记，允许重新发送提醒"
                    >
                      重置
                    </Button>
                  </div>
                </div>

                {debugInfo && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">提醒功能:</span>
                      <span className={debugInfo.enabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {debugInfo.enabled ? '✓ 已启用' : '✗ 未启用'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">设定时间:</span>
                      <span className="text-gray-900 dark:text-white font-mono">
                        {debugInfo.reminderTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">当前时间:</span>
                      <span className="text-gray-900 dark:text-white font-mono">
                        {debugInfo.currentTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">时间差:</span>
                      <span className="text-gray-900 dark:text-white font-mono">
                        {debugInfo.timeDiff} 分钟
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">在时间窗口内:</span>
                      <span className={debugInfo.withinWindow ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {debugInfo.withinWindow ? '✓ 是' : '✗ 否'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">今天已发送:</span>
                      <span className={debugInfo.alreadySentToday ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}>
                        {debugInfo.alreadySentToday ? '⚠️ 是' : '✓ 否'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">应该发送:</span>
                      <span className={debugInfo.shouldSend ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-600 dark:text-red-400'}>
                        {debugInfo.shouldSend ? '✓ 是' : '✗ 否'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">上次发送日期:</span>
                      <span className="text-gray-900 dark:text-white font-mono text-xs">
                        {debugInfo.lastReminderDate || '从未发送'}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        提示: 如果"在时间窗口内"显示否，说明当前时间距离设定时间超过5分钟。
                        如果"今天已发送"显示是，说明今天已经发送过提醒了。
                        点击"模拟提醒"可以立即发送一条真实的每日提醒通知。
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
