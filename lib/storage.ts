import { Platform } from "react-native";

const isWeb = Platform.OS === "web";
const inMemoryStorage: Record<string, string> = {};

let AsyncStorage: any;
if (!isWeb) {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
}

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isWeb) {
      return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    } else if (AsyncStorage) {
      return await AsyncStorage.getItem(key);
    } else {
      return inMemoryStorage[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, value);
      }
    } else if (AsyncStorage) {
      await AsyncStorage.setItem(key, value);
    } else {
      inMemoryStorage[key] = value;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isWeb) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } else if (AsyncStorage) {
      await AsyncStorage.removeItem(key);
    } else {
      delete inMemoryStorage[key];
    }
  },
};

export default storage;