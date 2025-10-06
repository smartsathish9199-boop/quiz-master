import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import QuizPage from './pages/user/QuizPage';
import ResultPage from './pages/user/ResultPage';
import PayoutPage from './pages/user/PayoutPage';
import SettingsPage from './pages/user/SettingsPage';
import CompetitionsPage from './pages/user/CompetitionsPage';
import CompetitionQuizPage from './pages/user/CompetitionQuizPage';
import AchievementsPage from './pages/user/AchievementsPage';
import NotFound from './pages/NotFound';
import AuthGuard from './components/guards/AuthGuard';
import AdminGuard from './components/guards/AdminGuard';
import { UserProvider } from './contexts/UserContext';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminCompetitions from './pages/admin/AdminCompetitions';
import AdminLogin from './pages/admin/AdminLogin';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <UserProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* User routes */}
          <Route path="/user" element={
            <AuthGuard>
              <UserDashboard />
            </AuthGuard>
          } />
          <Route path="/quiz" element={
            <AuthGuard>
              <QuizPage />
            </AuthGuard>
          } />
          <Route path="/result" element={
            <AuthGuard>
              <ResultPage />
            </AuthGuard>
          } />
          <Route path="/payout" element={
            <AuthGuard>
              <PayoutPage />
            </AuthGuard>
          } />
          <Route path="/settings" element={
            <AuthGuard>
              <SettingsPage />
            </AuthGuard>
          } />
          <Route path="/competitions" element={
            <AuthGuard>
              <CompetitionsPage />
            </AuthGuard>
          } />
          <Route path="/achievements" element={
            <AuthGuard>
              <AchievementsPage />
            </AuthGuard>
          } />
          <Route path="/competition-quiz/:competitionId" element={
            <AuthGuard>
              <CompetitionQuizPage />
            </AuthGuard>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          } />
          <Route path="/admin/users" element={
            <AdminGuard>
              <AdminUsers />
            </AdminGuard>
          } />
          <Route path="/admin/questions" element={
            <AdminGuard>
              <AdminQuestions />
            </AdminGuard>
          } />
          <Route path="/admin/transactions" element={
            <AdminGuard>
              <AdminTransactions />
            </AdminGuard>
          } />
          <Route path="/admin/competitions" element={
            <AdminGuard>
              <AdminCompetitions />
            </AdminGuard>
          } />
          
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;