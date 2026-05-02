import type { StorageInterface } from './storage.types';

export const storage: StorageInterface = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return Promise.resolve(null);
    const value = window.localStorage.getItem(key);
    return Promise.resolve(value);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return Promise.resolve();
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return Promise.resolve();
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};
