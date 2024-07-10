import { Platform } from "react-native";

const isClient = typeof window !== "undefined";
const hasAsyncStorage = typeof AsyncStorage !== "undefined";

const inMemoryStorage: Record<string, string> = {};

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isClient) {
      return localStorage.getItem(key);
    } else if (hasAsyncStorage) {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem(key);
    } else {
      return inMemoryStorage[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isClient) {
      localStorage.setItem(key, value);
    } else if (hasAsyncStorage) {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem(key, value);
    } else {
      inMemoryStorage[key] = value;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isClient) {
      localStorage.removeItem(key);
    } else if (hasAsyncStorage) {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.removeItem(key);
    } else {
      delete inMemoryStorage[key];
    }
  },
};

export default storage;
