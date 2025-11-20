'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useChatStore } from '@/lib/store/chatStore';
import { useStreaming } from '@/lib/hooks/useStreaming';
import { sessionsAPI } from '@/lib/api/sessions';
import { ChatThread } from '@/app/components/chat/ChatThread';
import { ChatInput } from '@/app/components/chat/ChatInput';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { ContextPanel } from '@/app/components/layout/ContextPanel';
import { Message } from '@/lib/types';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const { apiKey } = useAuthStore();
  const { messages, isLoading, setIsLoading, addMessage, loadMessages } = useChatStore();
  const { subscribeToStream } = useStreaming({
    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Streaming] Error:', msg);
      setError(msg);
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextPanelOpen, setContextPanelOpen] = useState(true);

  // Check authentication and load conversation history
  useEffect(() => {
    if (!apiKey) {
      router.push('/auth/login');
      return;
    }

    const loadConversation = async () => {
      try {
        setError(null);
        const response = await sessionsAPI.getMessages(sessionId);
        // API returns an array of messages
        if (Array.isArray(response)) {
          loadMessages(response);
        }
        setIsInitialized(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load conversation';
        setError(errorMessage);
        console.error('Failed to load conversation:', err);
        setIsInitialized(true);
      }
    };

    loadConversation();
  }, [apiKey, sessionId, router, loadMessages]);

  // Handle sending a new message
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!apiKey || !sessionId) return;

      try {
        setError(null);
        setIsLoading(true);

        // Create a temporary ID for the user message
        const userMessageId = `msg-${Date.now()}`;
        const userMessage: Message = {
          id: userMessageId,
          role: 'user',
          content: text,
          tokensUsed: 0,
          createdAt: new Date().toISOString(),
        };

        // Add user message to store
        addMessage(userMessage);

        // Send message to backend
        // Use OpenAI provider
        const response = await sessionsAPI.sendMessage(sessionId, text, 'openai');

        if (response.stream_id) {
          // Create assistant message placeholder
          const assistantMessageId = `msg-${Date.now()}-assistant`;
          const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            tokensUsed: 0,
            createdAt: new Date().toISOString(),
          };

          addMessage(assistantMessage);

          // Subscribe to streaming response
          subscribeToStream(response.stream_id, assistantMessageId);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        console.error('Failed to send message:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, sessionId, addMessage, setIsLoading, subscribeToStream]
  );

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-slate-400">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Left Sidebar */}
      <Sidebar
        currentSessionId={sessionId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-700 bg-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-slate-700 rounded transition-colors"
                  title="Toggle sidebar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-xl font-semibold">Vx Predict</h1>
                <p className="text-sm text-slate-400">
                  Session: {sessionId.slice(0, 8)}...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setContextPanelOpen(!contextPanelOpen)}
                className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
                title="Toggle context panel"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/20 border-l-4 border-red-500 px-4 py-3 text-red-300 text-sm">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatThread messages={messages} isLoading={isLoading} />
        </div>

        {/* Input area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={!apiKey || isLoading}
        />
      </div>

      {/* Right Context Panel */}
      <ContextPanel
        isOpen={contextPanelOpen}
        onClose={() => setContextPanelOpen(false)}
      />
    </div>
  );
}
