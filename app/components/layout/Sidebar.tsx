'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

interface SidebarProps {
  currentSessionId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ currentSessionId, isOpen = true, onClose }: SidebarProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [recentSessions, setRecentSessions] = useState<
    Array<{ id: string; createdAt: string }>
  >([
    // These would be loaded from localStorage or API in production
  ]);

  const handleNewSession = () => {
    router.push('/dashboard');
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-0'
      } bg-slate-800 border-r border-slate-700 transition-all duration-300 overflow-hidden flex flex-col h-screen`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-semibold text-white">Vx Predict</h1>
        <p className="text-xs text-slate-400 mt-1">Healthcare Forecasting</p>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* New Session Button */}
        <button
          onClick={handleNewSession}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
        >
          + New Session
        </button>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase px-2 mb-2">
              Recent
            </h3>
            <div className="space-y-1">
              {recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/${session.id}`}
                  className={`block px-3 py-2 rounded text-sm transition-colors ${
                    currentSessionId === session.id
                      ? 'bg-blue-600/50 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <div className="truncate">{session.id.slice(0, 8)}...</div>
                  <div className="text-xs text-slate-500">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {recentSessions.length === 0 && (
          <div className="text-sm text-slate-400 text-center py-8">
            No recent sessions
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="border-t border-slate-700 p-4 space-y-2">
        <Link
          href="/dashboard"
          className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
        >
          Home
        </Link>
        <Link
          href="/settings"
          className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
        >
          Settings
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-red-600/20 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
