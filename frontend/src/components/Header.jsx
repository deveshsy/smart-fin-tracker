/**
 * Header — Top navigation bar with branding, service health badges,
 * user greeting, and logout control.
 */
import React from 'react';
import { Activity, Brain, RefreshCw, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ backendStatus, mlStatus, onRefresh }) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent m-0 tracking-tight">
              Smart FinTracker
            </h1>
            <p className="text-xs text-slate-400">AI-Powered Monorepo Financials</p>
          </div>
        </div>

        {/* Right: Health Indicators, User, Logout */}
        <div className="flex items-center space-x-4">
          {/* Health badges */}
          <div className="hidden sm:flex space-x-2 text-xs">
            <span className="flex items-center px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
              <span className={`w-2 h-2 rounded-full mr-1.5 ${backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              API
            </span>
            <span className="flex items-center px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
              <Brain className="w-3 h-3 text-purple-400 mr-1" />
              ML {mlStatus === 'online' ? '✓' : '✗'}
            </span>
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* User badge + Logout */}
          {user && (
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-900/80 rounded-full border border-slate-800">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs text-slate-300 font-medium">{user.name || user.email}</span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-rose-950 hover:border-rose-800 text-slate-400 hover:text-rose-400 transition-all duration-200"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
