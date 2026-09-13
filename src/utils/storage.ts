/**
 * Safe LocalStorage Utility
 * Compatible with Windows 7, older browsers, and private browsing modes.
 * Prevents throwing SecurityError or QuotaExceededError.
 */

export const safeStorage = {
  getItem: <T>(key: string, fallback: T): T => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return fallback;
      }
      const item = window.localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`[Storage] Failed to read key "${key}", using fallback:`, e);
      return fallback;
    }
  },

  setItem: <T>(key: string, value: T): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[Storage] Failed to save key "${key}":`, e);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      window.localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`[Storage] Failed to remove key "${key}":`, e);
      return false;
    }
  },
};
