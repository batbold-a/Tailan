import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AuthPage } from './pages/Auth';
import { Layout } from './components/Layout';
import { isSupabaseConfigured } from './lib/supabase';
import { ConfigWarning } from './components/ConfigWarning';
import { Dashboard } from './pages/Dashboard';
import { AssignmentsPage } from './pages/Assignments';
import { PlanPage } from './pages/Plan';
import { ActualPage } from './pages/Actual';
import { ReportsPage } from './pages/Reports';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { SubscribePage } from './pages/Subscribe';

// Protects routes: requires login + active subscription
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, isSubscribed, subscriptionLoading } = useAuth();

  if (loading || subscriptionLoading) return <LoadingView />;
  if (!session) return <Navigate to="/auth" />;
  if (!isSubscribed) return <Navigate to="/subscribe" />;

  return <Layout>{children}</Layout>;
};

const LoadingView = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Програм ачаалж байна...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { session, loading } = useAuth();

  if (!isSupabaseConfigured) {
    return <ConfigWarning />;
  }

  if (loading) return <LoadingView />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={session ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Subscription page — accessible when logged in but not subscribed */}
        <Route path="/subscribe" element={<SubscribePage />} />

        {/* Protected routes — require login + active subscription */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
        <Route path="/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
        <Route path="/actual" element={<ProtectedRoute><ActualPage /></ProtectedRoute>} />
        <Route path="/reports/*" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
