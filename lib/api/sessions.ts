import apiClient from './client';
import { CreateSessionResponse, PostMessageResponse, GetMessagesResponse, GetUsageResponse } from '../types';

export const sessionsAPI = {
  // Create a new session
  createSession: async (): Promise<CreateSessionResponse> => {
    const response = await apiClient.post('/api/sessions', {});
    return response.data;
  },

  // Send a message to a session
  sendMessage: async (sessionId: string, text: string, providerHint?: string): Promise<PostMessageResponse> => {
    const response = await apiClient.post(`/api/sessions/${sessionId}/messages`, {
      text,
      provider_hint: providerHint,
    });
    return response.data;
  },

  // Get all messages in a session
  getMessages: async (sessionId: string): Promise<GetMessagesResponse> => {
    const response = await apiClient.get(`/api/sessions/${sessionId}/messages`);
    return response.data;
  },

  // Get usage stats for a session
  getUsage: async (sessionId: string): Promise<GetUsageResponse> => {
    const response = await apiClient.get(`/api/sessions/${sessionId}/usage`);
    return response.data;
  },
};
