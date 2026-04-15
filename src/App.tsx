import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HomePage } from '@/pages/HomePage';
import { QuestionPage } from '@/pages/QuestionPage';
import { QuestionExplorerPage } from '@/pages/QuestionExplorerPage';
import { SlotMachinePage } from '@/pages/SlotMachinePage';
import { SlotMachineAnswerPage } from '@/pages/SlotMachineAnswerPage';
import { CategoryListPage } from '@/pages/CategoryListPage';
import { GrowthTrackerPage } from '@/pages/GrowthTrackerPage';
import { QuestionGeneratorPage } from '@/pages/QuestionGeneratorPage';
import { NotificationSettingsPage } from '@/pages/NotificationSettingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { InspirationPage } from '@/pages/InspirationPage';
import { InspirationDomainPage } from '@/pages/InspirationDomainPage';
import { CollectionDetailPage } from '@/pages/CollectionDetailPage';
import { LaterPage } from '@/pages/LaterPage';
import { TurtleSoupPage } from '@/pages/TurtleSoupPage';
import { WritingPage } from '@/pages/WritingPage';
import { WritingChallengePage } from '@/pages/WritingChallengePage';
import { LogicReasoningPage } from '@/pages/LogicReasoningPage';
import { RiddlePage } from '@/pages/RiddlePage';
import { YesOrNoPage } from '@/pages/YesOrNoPage';
import { GuessNumberPage } from '@/pages/GuessNumberPage';
import { CheckInPage } from '@/pages/CheckInPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { TaskPage } from '@/pages/TaskPage';
import { RoundtablePage } from '@/pages/RoundtablePage';
import { QuestionThinkingHubPage } from '@/pages/QuestionThinkingHubPage';
import { DebateHallPage } from '@/pages/DebateHallPage';
import { useGlobalNotificationReminder } from '@/hooks/useGlobalNotificationReminder';
import { useSync } from '@/hooks/useSync';
import { useEffect, useRef } from 'react';
import { syncOnLogin } from '@/services/syncService';
import { autoMigrate } from '@/utils/dataMigration';

function App() {
  const syncTriggeredRef = useRef(false);

  // 自动迁移旧数据
  useEffect(() => {
    autoMigrate();
  }, []);

  // 在应用级别启动通知提醒，确保定时器始终运行
  useGlobalNotificationReminder();

  // 启动自动数据同步（登录用户）- 定时同步
  useSync(true);

  // 监听登录事件，自动同步数据（使用 ref 防止重复触发）
  useEffect(() => {
    const handleLogin = () => {
      // 防止重复触发同步
      if (syncTriggeredRef.current) {
        return;
      }

      console.log('检测到用户登录，开始自动同步...');
      syncTriggeredRef.current = true;

      // 延迟执行，确保用户状态已完全加载
      setTimeout(() => {
        syncOnLogin().finally(() => {
          // 3秒后重置标志，允许下次登录时再次同步
          setTimeout(() => {
            syncTriggeredRef.current = false;
          }, 3000);
        });
      }, 500);
    };

    const handleLogout = () => {
      // 登出时重置标志
      syncTriggeredRef.current = false;
    };

    window.addEventListener('user-logged-in', handleLogin);
    window.addEventListener('user-logged-out', handleLogout);

    return () => {
      window.removeEventListener('user-logged-in', handleLogin);
      window.removeEventListener('user-logged-out', handleLogout);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/questions" element={<QuestionThinkingHubPage />} />
        <Route path="/questions/explore" element={<QuestionExplorerPage />} />
        <Route path="/questions/growth" element={<GrowthTrackerPage />} />
        <Route path="/growth" element={<GrowthTrackerPage />} />
        <Route path="/questions/question-generator" element={<QuestionGeneratorPage />} />
        <Route path="/question-generator" element={<QuestionGeneratorPage />} />
        <Route path="/question/:id" element={<QuestionPage />} />
        <Route path="/questions/:id" element={<QuestionPage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/slot-machine" element={<SlotMachinePage />} />
        <Route path="/writing-challenge" element={<WritingChallengePage />} />
        <Route path="/slot-machine/answer" element={<SlotMachineAnswerPage />} />
        <Route path="/categories/:type" element={<CategoryListPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/later" element={<LaterPage />} />
        <Route path="/collections/:id" element={<CollectionDetailPage />} />
        <Route path="/logic-reasoning" element={<LogicReasoningPage />} />
        <Route path="/turtle-soup" element={<TurtleSoupPage />} />
        <Route path="/logic-reasoning/riddle" element={<RiddlePage />} />
        <Route path="/logic-reasoning/yes-or-no" element={<YesOrNoPage />} />
        <Route path="/logic-reasoning/guess-number" element={<GuessNumberPage />} />
        <Route path="/checkin" element={<CheckInPage />} />
        <Route path="/tasks" element={<TaskPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/roundtable/discuss" element={<RoundtablePage />} />
        <Route path="/debate" element={<DebateHallPage />} />
        <Route path="/inspiration" element={<InspirationPage />} />
        <Route path="/inspiration/:domainId" element={<InspirationDomainPage />} />
        <Route path="/notifications" element={<NotificationSettingsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="!bg-white/90 !backdrop-blur-md !text-gray-800 !shadow-xl !border !border-gray-200/50 !rounded-xl"
        progressClassName="!bg-gradient-to-r !from-gray-400 !to-gray-500"
        className="!font-medium"
        closeButton={false}
      />
    </BrowserRouter>
  );
}

export default App;
