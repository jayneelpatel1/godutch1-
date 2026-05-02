import * as SecureStore from 'expo-secure-store';

import type { StorageInterface } from './storage.types';

export const storage: StorageInterface = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
