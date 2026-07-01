/**
 * App.jsx — Root component for Smart FinTracker.
 * Handles authentication gating: shows AuthPage for unauthenticated users,
 * Dashboard for authenticated users. Wrapped in AuthProvider.
 */
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import { RefreshCw } from 'lucide-react';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Show a loading spinner while verifying token on initial load
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin w-10 h-10 text-indigo-500 mx-auto" />
          <p className="text-sm text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
