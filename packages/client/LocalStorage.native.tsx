import { MMKV, MMKVConfiguration } from "react-native-mmkv";

export type NativeCoreStorageModule = ReturnType<typeof createLocalStorage>;

export function createLocalStorage(config: MMKVConfiguration | undefined) {
  const storage = new MMKV(config);

  function dangerouslyDeleteEverything() {
    storage.clearAll();
  }

  function getStoredJSON(key: string) {
    const stored = storage.getString(key);
    if (stored === undefined) return undefined;
    return JSON.parse(stored);
  }

  function saveJSON(key: string, value: Parameters<typeof JSON.stringify>[0]) {
    storage.set(key, JSON.stringify(value));
  }

  function deleteKey(key: string) {
    storage.delete(key);
  }

  return { getStoredJSON, saveJSON, dangerouslyDeleteEverything, deleteKey };
}
