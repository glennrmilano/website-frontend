'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { sessionsAPI } from '@/lib/api/sessions';

export default function DashboardPage() {
  const router = useRouter();
  const { apiKey, isAuthenticated, isLoading, loadFromStorage, logout } = useAuthStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [recentSessions, setRecentSessions] = useState<string[]>([]);

  // Load auth state on mount
  useEffect(() => {
    console.log('[Dashboard] Mounting - loading auth state from storage');
    loadFromStorage();
  }, []);

  // Redirect if not authenticated (only after loading is complete)
  useEffect(() => {
    console.log('[Dashboard] Auth check - isLoading:', isLoading, 'apiKey:', apiKey ? '✓ present' : '✗ missing');
    if (!isLoading && !apiKey) {
      console.log('[Dashboard] No API key after loading - redirecting to login');
      router.push('/auth/login');
    }
  }, [isLoading, apiKey, router]);

  // Create a new session
  const handleNewSession = async () => {
    setIsCreatingSession(true);
    try {
      const response = await sessionsAPI.createSession();
      const newSessionId = response.session_id;
      setSessionId(newSessionId);
      setRecentSessions((prev) => [newSessionId, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session');
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Navigate to session
  const handleSelectSession = (sid: string) => {
    setSessionId(sid);
    router.push(`/dashboard/${sid}`);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Show loading state while auth is being initialized
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Vx Predict</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to Vx Predict</h2>
          <p className="text-slate-300">Healthcare supply chain forecasting with AI</p>
        </div>

        {/* New Session Button */}
        <button
          onClick={handleNewSession}
          disabled={isCreatingSession}
          className="mb-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
        >
          {isCreatingSession ? 'Creating session...' : '+ New Forecast Session'}
        </button>

        {/* Current Session Display */}
        {sessionId ? (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Current Session</h3>
            <p className="text-slate-300 mb-4">
              Session ID: <code className="bg-slate-700 px-2 py-1 rounded text-sm">{sessionId}</code>
            </p>
            <button
              onClick={() => router.push(`/dashboard/${sessionId}`)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Open Session
            </button>
          </div>
        ) : null}

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
            <div className="space-y-2">
              {recentSessions.map((sid) => (
                <button
                  key={sid}
                  onClick={() => handleSelectSession(sid)}
                  className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                >
                  <code className="text-sm">{sid}</code>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>Getting Started:</strong> Click "New Forecast Session" to create a new session, then start asking questions about supply chain demand forecasting.
          </p>
        </div>
      </main>
    </div>
  );
}
