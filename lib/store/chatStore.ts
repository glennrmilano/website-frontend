import { create } from 'zustand';
import { Message, Artifact } from '../types';

export interface ChatStore {
  messages: Message[];
  artifacts: Artifact[];
  isLoading: boolean;
  streamingMessageId: string | null;
  currentStreamingContent: string;

  // Actions
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  addArtifact: (artifact: Artifact) => void;
  startStreaming: (messageId: string) => void;
  appendStreamingContent: (content: string) => void;
  completeStreaming: () => void;
  setIsLoading: (loading: boolean) => void;
  clearMessages: () => void;
  loadMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  artifacts: [],
  isLoading: false,
  streamingMessageId: null,
  currentStreamingContent: '',

  addMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (messageId: string, updates: Partial<Message>) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    })),

  addArtifact: (artifact: Artifact) =>
    set((state) => ({
      artifacts: [...state.artifacts, artifact],
    })),

  startStreaming: (messageId: string) =>
    set({
      streamingMessageId: messageId,
      currentStreamingContent: '',
    }),

  appendStreamingContent: (content: string) =>
    set((state) => ({
      currentStreamingContent: state.currentStreamingContent + content,
    })),

  completeStreaming: () => {
    set((state) => {
      if (state.streamingMessageId) {
        // Find the message and update it with the final content
        const messages = state.messages.map((msg) =>
          msg.id === state.streamingMessageId
            ? { ...msg, content: state.currentStreamingContent }
            : msg
        );
        return {
          messages,
          streamingMessageId: null,
          currentStreamingContent: '',
        };
      }
      return {
        streamingMessageId: null,
        currentStreamingContent: '',
      };
    });
  },

  setIsLoading: (loading: boolean) =>
    set({
      isLoading: loading,
    }),

  clearMessages: () =>
    set({
      messages: [],
      artifacts: [],
      streamingMessageId: null,
      currentStreamingContent: '',
    }),

  loadMessages: (messages: Message[]) =>
    set({
      messages,
    }),
}));
