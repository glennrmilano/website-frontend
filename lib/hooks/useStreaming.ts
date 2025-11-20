import { useEffect, useCallback, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { StreamEvent } from '../types';

interface UseStreamingOptions {
  onArtifactCreated?: (artifactId: string) => void;
  onToolStart?: (toolName: string) => void;
  onToolResult?: (toolName: string, result: string) => void;
  onError?: (error: Error) => void;
}

export const useStreaming = (options: UseStreamingOptions = {}) => {
  const {
    addMessage,
    updateMessage,
    addArtifact,
    startStreaming,
    appendStreamingContent,
    completeStreaming,
  } = useChatStore();

  const { apiKey } = useAuthStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  const subscribeToStream = useCallback(
    (streamId: string, messageId: string) => {
      if (!apiKey) {
        options.onError?.(new Error('No API key available'));
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const streamUrl = `${apiUrl}/api/streams/${streamId}`;

      // Use fetch with streaming so we can send Authorization header
      subscribeWithFetch(streamUrl, messageId, apiKey);
    },
    [apiKey, startStreaming, appendStreamingContent, completeStreaming, addArtifact, options]
  );

  const subscribeWithFetch = useCallback(
    async (streamUrl: string, messageId: string, token: string) => {
      try {
        startStreaming(messageId);

        console.log('[Streaming] Subscribing to', streamUrl, 'for message', messageId);

        const response = await fetch(streamUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error(`Stream error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Process all complete lines
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith(':')) continue; // Skip empty lines and comments

            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              try {
                const event: StreamEvent = JSON.parse(dataStr);
                if ((event as any).type && (event as any).type !== 'token') {
                  console.log('[Streaming] Event:', (event as any).type);
                }
                handleStreamEvent(event, messageId);
              } catch (e) {
                console.error('Failed to parse stream event:', e);
              }
            }
          }

          // Keep the last incomplete line in the buffer
          buffer = lines[lines.length - 1];
        }

        // Process any remaining data
        if (buffer.trim()) {
          if (buffer.trim().startsWith('data: ')) {
            const dataStr = buffer.trim().slice(6);
            try {
              const event: StreamEvent = JSON.parse(dataStr);
              handleStreamEvent(event, messageId);
            } catch (e) {
              console.error('Failed to parse final stream event:', e);
            }
          }
        }

        completeStreaming();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[Streaming] Error while reading stream:', err.message);
        options.onError?.(err);
        completeStreaming();
      }
    },
    [startStreaming, appendStreamingContent, completeStreaming, addArtifact, updateMessage, options]
  );

  const handleStreamEvent = (event: StreamEvent, messageId: string) => {
    switch (event.type) {
      case 'token':
        appendStreamingContent(event.content);
        break;

      case 'tool_start':
        options.onToolStart?.(event.tool_name);
        // Add a tool indicator to the message
        updateMessage(messageId, {
          toolCalls: [
            ...(useChatStore.getState().messages.find((m) => m.id === messageId)?.toolCalls || []),
            {
              id: `${event.tool_name}-${Date.now()}`,
              name: event.tool_name,
              status: 'running',
              input: event.input || {},
            },
          ],
        });
        break;

      case 'tool_result':
        options.onToolResult?.(event.tool_name, event.result);
        // Update the tool call status
        const messages = useChatStore.getState().messages;
        const msg = messages.find((m) => m.id === messageId);
        if (msg && msg.toolCalls) {
          updateMessage(messageId, {
            toolCalls: msg.toolCalls.map((tc) =>
              tc.name === event.tool_name
                ? { ...tc, status: 'completed', output: event.result }
                : tc
            ),
          });
        }
        break;

      case 'artifact_created':
        addArtifact({
          id: event.artifact_id,
          kind: event.kind as any,
          title: event.title,
          content: event.content || '',
        });
        options.onArtifactCreated?.(event.artifact_id);
        break;

      case 'error':
        // Surface server-side error events to the UI
        options.onError?.(new Error((event as any).message || 'Stream error'));
        completeStreaming();
        break;

      case 'done':
        completeStreaming();
        break;
    }
  };

  const unsubscribe = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return { subscribeToStream, unsubscribe };
};
