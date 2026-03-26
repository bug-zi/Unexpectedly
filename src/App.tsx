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
import { KnowledgePopularizePage } from '@/pages/KnowledgePopularizePage';
import { WorldRecordsPage } from '@/pages/WorldRecordsPage';
import { SystemsThinkingPage } from '@/pages/SystemsThinkingPage';
import { HealthManagementPage } from '@/pages/HealthManagementPage';
import { KnowledgeAIAskPage } from '@/pages/KnowledgeAIAskPage';
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
import { useGlobalNotificationReminder } from '@/hooks/useGlobalNotificationReminder';

function App() {
  // 在应用级别启动通知提醒，确保定时器始终运行
  useGlobalNotificationReminder();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/questions" element={<QuestionExplorerPage />} />
        <Route path="/questions/growth" element={<GrowthTrackerPage />} />
        <Route path="/growth" element={<GrowthTrackerPage />} />
        <Route path="/questions/question-generator" element={<QuestionGeneratorPage />} />
        <Route path="/question-generator" element={<QuestionGeneratorPage />} />
        <Route path="/question/:id" element={<QuestionPage />} />
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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/knowledge-popularize" element={<KnowledgePopularizePage />} />
        <Route path="/knowledge-popularize/world-records" element={<WorldRecordsPage />} />
        <Route path="/knowledge-popularize/systems-thinking" element={<SystemsThinkingPage />} />
        <Route path="/knowledge-popularize/health-management" element={<HealthManagementPage />} />
        <Route path="/knowledge-popularize/ai-ask" element={<KnowledgeAIAskPage />} />
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
        theme="colored"
        toastClassName="!bg-gradient-to-r !from-yellow-500 !to-amber-500 !text-white !shadow-lg !border-0 !rounded-lg"
        progressClassName="!bg-yellow-300"
        bodyClassName="!font-medium"
        closeButton={false}
      />
    </BrowserRouter>
  );
}

export default App;
