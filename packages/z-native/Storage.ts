import { useCallback, useEffect, useState } from "react";
import { MMKVConfiguration } from "react-native-mmkv";
import { createNativeCoreStorage } from "./CoreStorage";

type Doc = { name: string; id: string };
type BlockLink = { type: "BlockLink"; id: string };
type DocList = Doc[];

type StorageNode<ValueType> = {
  key: string;
  get: () => ValueType;
  set: (v: ValueType) => void;
  mutate: (mutator: (v: ValueType) => ValueType) => void;
  updateHandlers: Set<(v: ValueType) => void>;
  destroy: () => void;
};

export type NativeStorageModule = ReturnType<typeof createNativeCoreStorage>;

export function createNativeStorage(config: MMKVConfiguration | undefined) {
  const nativeStore = createNativeCoreStorage(config);

  function dangerouslyClearAllStorage() {
    nativeStore.dangerouslyDeleteEverything();
  }

  function createLocalStorageNode<ValueType>(
    key: string,
    defaultValue: ValueType
  ): StorageNode<ValueType> {
    const updateHandlers = new Set<(v: ValueType) => void>();
    let isDestroyed = false;
    const storedValue = nativeStore.getStoredJSON(key);
    let value: ValueType = storedValue;
    if (value === undefined) {
      value = defaultValue;
      if (defaultValue !== undefined) {
        nativeStore.saveJSON(key, defaultValue);
      }
    }
    function get(): ValueType {
      if (isDestroyed) throw new Error("Storage node has been destroyed");
      return value;
    }
    function set(v: ValueType) {
      if (isDestroyed) throw new Error("Storage node has been destroyed");
      nativeStore.saveJSON(key, v);
      value = v;
      updateHandlers.forEach((handler) => handler(v));
    }
    function mutate(mutator: (v: ValueType) => ValueType) {
      if (isDestroyed) throw new Error("Storage node has been destroyed");
      const newValue = mutator(value);
      if (value === newValue) return;
      nativeStore.saveJSON(key, newValue);
      value = newValue;
      updateHandlers.forEach((handler) => handler(newValue));
    }
    function destroy() {
      isDestroyed = true;
      nativeStore.deleteKey(key);
    }
    return { key, get, set, mutate, destroy, updateHandlers };
  }

  const localStorageNodes: Record<string, StorageNode<any>> = {};

  function getStorageNode<ValueType>(
    key: string,
    defaultValue: ValueType
  ): StorageNode<ValueType> {
    if (localStorageNodes[key]) return localStorageNodes[key];
    const node = createLocalStorageNode<ValueType>(key, defaultValue);
    localStorageNodes[key] = node;
    return node;
  }

  function mutateStorage<ValueType>(
    key: string,
    defaultValue: ValueType,
    mutator: (value: ValueType) => ValueType
  ) {
    const storageNode = getStorageNode<ValueType>(key, defaultValue);
    const previousValue = storageNode.get();
    const newValue = mutator(previousValue);
    storageNode.set(newValue);
  }

  function useNodeState<V>(node: StorageNode<V>) {
    const [componentStorageState, setComponentStorageState] = useState<V>(
      node.get()
    );
    const setInternal = useCallback(
      (value: V) => {
        setComponentStorageState(value);
      },
      [node.key]
    );
    useEffect(() => {
      node.updateHandlers.add(setInternal);
      return () => {
        node.updateHandlers.delete(setInternal);
      };
    }, [node.key]);
    return componentStorageState;
  }

  function useStorage<V>(key: string, defaultValue: V) {
    const storageNode = getStorageNode(key, defaultValue);
    const componentStorageState = useNodeState(storageNode);
    return [componentStorageState, storageNode.set] as const;
  }

  function useStored<V>(key: string, defaultValue: V) {
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

  return {
    useStored,
    useStorage,
    useNodeState,
    mutateStorage,
    getStorageNode,
    dangerouslyClearAllStorage,
  };
}
