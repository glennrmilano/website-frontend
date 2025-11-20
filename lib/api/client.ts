import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Add auth header to all requests
apiClient.interceptors.request.use((config) => {
  const apiKey = useAuthStore.getState().apiKey;
  console.log('[API Client] Request to:', config.url, 'with apiKey:', apiKey ? '✓ present' : '✗ missing');
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Client] Error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Redirect to login on auth failure
      console.log('[API Client] 401 Unauthorized - logging out');
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
