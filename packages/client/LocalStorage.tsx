import { MMKVConfiguration } from "react-native-mmkv";

export type NativeCoreStorageModule = ReturnType<typeof createLocalStorage>;

export function createLocalStorage(config: MMKVConfiguration | undefined) {
  const storeId = config.id;

  const grossStorage = global.window?.localStorage;

  function dangerouslyDeleteEverything() {
    console.log("DELETINGEVERYTHING");
  }

  function getStoredJSON(key: string) {
    if (!grossStorage) return;
    const data = grossStorage[`${storeId}_${key}`];
    return data && JSON.parse(data);
  }

  function saveJSON(key: string, value: Parameters<typeof JSON.stringify>[0]) {
    if (!grossStorage) return;
    grossStorage[`${storeId}_${key}`] = JSON.stringify(value);
  }

  function deleteKey(key: string) {
    if (!grossStorage) return;
    delete grossStorage[`${storeId}_${key}`];
  }

  return { getStoredJSON, saveJSON, dangerouslyDeleteEverything, deleteKey };
}
