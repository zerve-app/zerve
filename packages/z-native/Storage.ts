import { useCallback, useEffect, useState } from "react";
import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();

type Doc = { name: string; id: string };
type BlockLink = { type: "BlockLink"; id: string };
type DocList = Doc[];

function getStoredJSON(key: string) {
  const stored = storage.getString(key);
  console.log("LOADED FROM DISK BABY", key);
  if (stored === undefined) return undefined;
  return JSON.parse(stored);
}

function saveJSON(key: string, value: Parameters<typeof JSON.stringify>[0]) {
  storage.set(key, JSON.stringify(value));
}

type StorageNode<ValueType> = {
  get: () => ValueType;
  set: (v: ValueType) => void;
  updateHandlers: Set<(v: ValueType) => void>;
};

function createLocalStorageNode<ValueType>(
  key: string,
  defaultValue: ValueType
): StorageNode<ValueType> {
  const updateHandlers = new Set<() => ValueType>();
  let value: ValueType = getStoredJSON(key) || defaultValue;
  function get(): ValueType {
    return value;
  }
  function set(v: ValueType) {
    saveJSON(key, v);
    value = v;
    updateHandlers.forEach((handler) => handler(v));
  }
  return { get, set, updateHandlers };
}

const localStorageNodes: Record<string, StorageNode<any>> = {};

function getStorageNode<ValueType>(key: string, defaultValue: ValueType) {
  if (localStorageNodes[key]) return localStorageNodes[key];
  const node = createLocalStorageNode(key, defaultValue);
  localStorageNodes[key] = node;
  return node;
}

export function mutateStorage<ValueType>(
  key: string,
  defaultValue: ValueType,
  mutator: (value: ValueType) => ValueType
) {
  const storageNode = getStorageNode<ValueType>(key, defaultValue);
  const previousValue = storageNode.get();
  const newValue = mutator(previousValue);
  storageNode.set(newValue);
}

export function useStorage<V>(key: string, defaultValue: V) {
  const storageNode = getStorageNode(key, defaultValue);
  const [componentStorageState, setComponentStorageState] = useState<V>(
    storageNode.get()
  );

  const setInternal = useCallback(
    (value: V) => {
      setComponentStorageState(value);
    },
    [key]
  );
  useEffect(() => {
    storageNode.updateHandlers.add(setInternal);
    return () => {
      storageNode.updateHandlers.delete(setInternal);
    };
  }, [key]);
  return componentStorageState;
}

export function useDocList() {
  return useStorage("z:doc:list", []);
}

export function useBlueGreen() {
  const [state, set] = useStorage<"blue" | "green">("BlueOrGreen", "blue");
  const toggle = useCallback(() => {
    set(state === "green" ? "blue" : "green");
  }, [state]);
  return [state, toggle] as const;
}
