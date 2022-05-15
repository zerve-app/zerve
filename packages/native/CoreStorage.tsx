import { MMKVConfiguration } from "react-native-mmkv";

export type NativeCoreStorageModule = ReturnType<
  typeof createNativeCoreStorage
>;

export function createNativeCoreStorage(config: MMKVConfiguration | undefined) {
  console.log("webstore init", config);

  function dangerouslyDeleteEverything() {
    console.log("DELETINGEVERYTHING");
  }

  function getStoredJSON(key: string) {
    console.log("getStoredJSON", key);
    return undefined;
  }

  function saveJSON(key: string, value: Parameters<typeof JSON.stringify>[0]) {
    console.log("saveJSON", key, value);
  }

  function deleteKey(key: string) {
    console.log("deleteKey", key);
  }

  return { getStoredJSON, saveJSON, dangerouslyDeleteEverything, deleteKey };
}
