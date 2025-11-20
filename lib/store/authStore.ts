import { create } from 'zustand';
import { AuthStore } from '../types';

const STORAGE_KEY = 'vx-predict-api-key';

export const useAuthStore = create<AuthStore>((set) => ({
  apiKey: null,
  isAuthenticated: false,
  isLoading: true, // Track auth initialization

  setApiKey: (key: string) => {
    console.log('[AuthStore] setApiKey called with:', key ? '✓ present' : '✗ missing');
    localStorage.setItem(STORAGE_KEY, key);
    console.log('[AuthStore] Stored to localStorage:', localStorage.getItem(STORAGE_KEY) ? '✓ stored' : '✗ failed');
    set({ apiKey: key, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    console.log('[AuthStore] logout called');
    localStorage.removeItem(STORAGE_KEY);
    set({ apiKey: null, isAuthenticated: false, isLoading: false });
  },

  loadFromStorage: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('[AuthStore] loadFromStorage - found in localStorage:', stored ? '✓ yes' : '✗ no');
    if (stored) {
      console.log('[AuthStore] Setting apiKey from storage');
      set({ apiKey: stored, isAuthenticated: true, isLoading: false });
    } else {
      console.log('[AuthStore] No key in storage, clearing auth state');
      set({ apiKey: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
