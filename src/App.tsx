import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HomePage } from '@/pages/HomePage';
import { QuestionPage } from '@/pages/QuestionPage';
import { SlotMachinePage } from '@/pages/SlotMachinePage';
import { CategoryListPage } from '@/pages/CategoryListPage';
import { GrowthTrackerPage } from '@/pages/GrowthTrackerPage';
import { QuestionGeneratorPage } from '@/pages/QuestionGeneratorPage';
import { NotificationSettingsPage } from '@/pages/NotificationSettingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { CollectionDetailPage } from '@/pages/CollectionDetailPage';
import { LaterPage } from '@/pages/LaterPage';
import { useGlobalNotificationReminder } from '@/hooks/useGlobalNotificationReminder';

function App() {
  // 在应用级别启动通知提醒，确保定时器始终运行
  useGlobalNotificationReminder();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/question/:id" element={<QuestionPage />} />
        <Route path="/slot-machine" element={<SlotMachinePage />} />
        <Route path="/categories/:type" element={<CategoryListPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/later" element={<LaterPage />} />
        <Route path="/collections/:id" element={<CollectionDetailPage />} />
        <Route path="/growth" element={<GrowthTrackerPage />} />
        <Route path="/question-generator" element={<QuestionGeneratorPage />} />
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
      />
    </BrowserRouter>
  );
}

export default App;
