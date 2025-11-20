'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuthKey = useAuthStore((state) => state.setApiKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    setIsLoading(true);

    try {
      // Demo mode: Accept any API key for now
      // TODO: Re-enable backend validation when backend is deployed
      console.log('Demo mode: Bypassing backend authentication');

      // Simple validation: just check if key is not empty
      if (apiKey.length < 5) {
        setError('API key must be at least 5 characters');
        setIsLoading(false);
        return;
      }

      // Store the API key
      setAuthKey(apiKey);

      // Small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Vx Predict</h1>
          <p className="text-slate-300">Healthcare Supply Chain AI</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in with API Key</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* API Key Input */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
                API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_org_..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-400 mt-2">
                Demo mode: Enter any key (min 5 characters)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <p className="text-xs text-blue-300">
              <strong>Demo Mode:</strong> Backend authentication is disabled. Enter any API key (min 5 characters) to access the dashboard.
            </p>
          </div>
        </div>

        {/* Help */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            Need help? <a href="#" className="text-blue-400 hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
