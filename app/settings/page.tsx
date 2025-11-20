'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function SettingsPage() {
  const router = useRouter();
  const { apiKey, logout } = useAuthStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      router.push('/auth/login');
    }
  }, [apiKey, router]);

  const handleUpdateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newApiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    try {
      // Validate the new key by trying to create a session
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/sessions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error('Invalid API key');
      }

      // Update auth store with new key
      useAuthStore.getState().setApiKey(newApiKey);
      setNewApiKey('');
      setSuccess('API key updated successfully');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update API key');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const maskedApiKey = apiKey
    ? `${apiKey.slice(0, 10)}...${apiKey.slice(-4)}`
    : 'Not set';

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* API Key Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-6">API Key Management</h2>

          {/* Current API Key Display */}
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Current API Key
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-700 rounded px-4 py-2 text-slate-300 font-mono text-sm">
                {showApiKey && apiKey ? apiKey : maskedApiKey}
              </div>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
              {apiKey && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    setSuccess('API key copied to clipboard');
                    setTimeout(() => setSuccess(null), 2000);
                  }}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                >
                  Copy
                </button>
              )}
            </div>
          </div>

          {/* Update API Key Form */}
          <form onSubmit={handleUpdateApiKey} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New API Key
              </label>
              <textarea
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="Paste your new API key here..."
                rows={3}
                className="w-full bg-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Update API Key
            </button>
          </form>
        </div>

        {/* Usage Stats Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-6">Usage Statistics</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/30 rounded p-4">
              <p className="text-slate-400 text-sm mb-1">Sessions This Month</p>
              <p className="text-2xl font-bold text-blue-400">12</p>
            </div>
            <div className="bg-slate-700/30 rounded p-4">
              <p className="text-slate-400 text-sm mb-1">Total Tokens Used</p>
              <p className="text-2xl font-bold text-green-400">145,230</p>
            </div>
            <div className="bg-slate-700/30 rounded p-4">
              <p className="text-slate-400 text-sm mb-1">Average Response Time</p>
              <p className="text-2xl font-bold text-purple-400">2.3s</p>
            </div>
            <div className="bg-slate-700/30 rounded p-4">
              <p className="text-slate-400 text-sm mb-1">API Key Status</p>
              <p className="text-lg font-bold">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2" />
                Active
              </p>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-6">Preferences</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Dark Theme</label>
                <p className="text-sm text-slate-400">Enable dark mode</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Auto-save Sessions</label>
                <p className="text-sm text-slate-400">Automatically save conversation history</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Notifications</label>
                <p className="text-sm text-slate-400">Receive alerts for forecast updates</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
          <p className="text-sm text-slate-400 mt-2">
            You will be logged out and redirected to the login page.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-900/20 border-l-4 border-red-500 px-4 py-3 text-red-300 text-sm rounded">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border-l-4 border-green-500 px-4 py-3 text-green-300 text-sm rounded">
            <p className="font-semibold">Success</p>
            <p>{success}</p>
          </div>
        )}
      </div>
    </div>
  );
}
