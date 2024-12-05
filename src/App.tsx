import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Hot50Page } from './pages/Hot50Page';
import { TrackDetailsPage } from './pages/TrackDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { useThemeStore } from './lib/theme';
import { NotificationContainer } from './components/ui/NotificationContainer';

export default function App() {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <div className={isDark ? 'dark' : ''}>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Hot50Page />} />
            <Route path="/track/:position" element={<TrackDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </Router>
      <NotificationContainer />
    </div>
  );
}