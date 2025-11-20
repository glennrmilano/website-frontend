'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import { useChatStore } from '@/lib/store/chatStore';
import { StreamingMessage } from './StreamingMessage';
import { ArtifactViewer } from '@/app/components/artifacts/ArtifactViewer';

interface ChatThreadProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatThread({ messages, isLoading = false }: ChatThreadProps) {
  const { streamingMessageId, currentStreamingContent, artifacts } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingContent]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
          <p className="text-sm">Send a message to begin your forecasting session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      {messages.map((message) => (
        <div key={message.id}>
          <StreamingMessage
            message={message}
            isStreaming={streamingMessageId === message.id}
          />

          {/* Display artifacts created after this message */}
          {message.role === 'assistant' && artifacts.length > 0 && (
            <div className="mt-4 space-y-4">
              {artifacts.map((artifact) => (
                <ArtifactViewer key={artifact.id} artifact={artifact} />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
            Vx
          </div>
          <div className="bg-slate-700 text-slate-100 px-4 py-3 rounded-lg rounded-bl-none">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
