'use client';

import { Message } from '@/lib/types';
import { useChatStore } from '@/lib/store/chatStore';

interface StreamingMessageProps {
  message: Message;
  isStreaming: boolean;
}

export function StreamingMessage({ message, isStreaming }: StreamingMessageProps) {
  const { currentStreamingContent } = useChatStore();

  // Use streaming content if this message is currently streaming, otherwise use the saved content
  const displayContent = isStreaming ? currentStreamingContent : message.content;

  return (
    <div
      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
          Vx
        </div>
      )}

      <div
        className={`max-w-xl px-4 py-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-slate-700 text-slate-100 rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {displayContent}
        </p>

        {/* Tool indicators */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.toolCalls.map((toolCall) => (
              <div
                key={toolCall.id}
                className="text-xs bg-black/20 rounded px-2 py-1 flex items-center gap-2"
              >
                {toolCall.status === 'running' && (
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                )}
                {toolCall.status === 'completed' && (
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full" />
                )}
                <span className="font-mono">{toolCall.name}</span>
                {toolCall.status === 'completed' && (
                  <span className="text-green-300 text-xs ml-auto">✓</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-300">
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>Streaming...</span>
          </div>
        )}
      </div>
    </div>
  );
}
