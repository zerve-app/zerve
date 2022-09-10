import {
  drillSchemaValue,
  JSONSchema,
  lookUpValue,
  mergeValue,
} from "@zerve/zed";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type UnsavedCtx = {
  getDirtyValue: (id: string) => any;
  claimDirty: (id: string, value: any) => void;
  releaseDirty: (id: string) => void;
  discardDirty: () => void;
  dirtyId: null | string;
  getDirtyId: () => null | string;
  subscribeDirty: (id: string, handler: (v: any) => void) => () => void;
  hasUnsaved: () => boolean;
};

export const UnsavedContext = createContext<null | UnsavedCtx>(null);

export function useUnsavedContext() {
  const ctx = useContext(UnsavedContext);
  if (!ctx)
    throw new Error(
      "Must use this feature within an UnsavedContext Environment ",
    );
  return ctx;
}

export function useUnsaved(): UnsavedCtx {
  const dirtyIdRef = useRef<null | string>(null);
  const dirtyValue = useRef<null | any>(null);
  const [dirtyId, setDirtyId] = useState<null | string>(null);
  const dirtyValueSubscribers = useRef(
    new Map<string, Set<(value: any) => void>>(),
  );
  const dirtyValueNotifyTimeout = useRef(new Map<string, null | number>());
  const unsavedCtx = useMemo(() => {
    function notify(id: string, value: any) {
      const notifiers = dirtyValueSubscribers.current.get(id);
      const prevTimeout = dirtyValueNotifyTimeout.current.get(id);
      if (typeof prevTimeout === "number") clearTimeout(prevTimeout);
      dirtyValueNotifyTimeout.current.set(
        id,
        setTimeout(() => {
          notifiers?.forEach((notify) => notify(value));
        }, 150) as unknown as number,
      );
    }
    return {
      releaseDirty: (id: string) => {
        if (dirtyIdRef.current === id) {
          notify(id, undefined);
          dirtyValue.current = null;
          dirtyIdRef.current = null;
          setDirtyId(null);
        }
      },
      discardDirty: () => {
        if (dirtyIdRef.current) {
          notify(dirtyIdRef.current, undefined);
        }
        dirtyValue.current = null;
        dirtyIdRef.current = null;
        setDirtyId(null);
      },
      hasUnsaved: () => {
        return !!dirtyIdRef.current;
      },
      claimDirty: (id: string, value: any) => {
        dirtyValue.current = value;
        dirtyIdRef.current = id;
        if (dirtyId !== id) {
          setDirtyId(id);
        }
        notify(id, value);
      },
      getDirtyValue: (id: string) => {
        if (id === dirtyIdRef.current) return dirtyValue.current;
        return undefined;
      },
      subscribeDirty: (id: string, onDirtyValue: (value: any) => void) => {
        const idNotifiers = dirtyValueSubscribers.current;
        const notifiers = (() => {
          const prev = idNotifiers.get(id);
          if (prev) return prev;
          const n = new Set<(value: any) => void>();
          idNotifiers.set(id, n);
          return n;
        })();
        notifiers.add(onDirtyValue);
        return () => {
          notifiers.delete(onDirtyValue);
        };
      },
      getDirtyId: () => dirtyIdRef.current,
      dirtyId,
    };
  }, [dirtyId]);
  return unsavedCtx;
}

export function useUnsavedDeepValue({
  onImport,
  dirtyId,
  savedValue,
  path,
  fullSchema,
  isActive,
}: {
  onImport?: (v: any, schema: JSONSchema) => any;
  dirtyId: string;
  savedValue: any;
  path: string[];
  fullSchema: JSONSchema;
  isActive: boolean;
}) {
  const { schema: savedPathSchema, value: savedPathValue } = useMemo(() => {
    const importedValue =
      savedValue === undefined
        ? undefined
        : onImport
        ? onImport(savedValue, fullSchema)
        : savedValue;
    return drillSchemaValue(fullSchema, importedValue, path);
  }, [fullSchema, savedValue, path]);
  const {
    claimDirty,
    releaseDirty,
    dirtyId: currentDirtyId,
    getDirtyValue,
    subscribeDirty,
  } = useUnsavedContext();
  const [currentValue, setCurrentValue] = useState(getDirtyValue(dirtyId));
  const isDirty = currentDirtyId === dirtyId;
  const [localDraftValue, setLocalDraftValue] = useState(
    isActive && isDirty && currentValue
      ? lookUpValue(currentValue, path)
      : undefined,
  );
  useEffect(() => {
    return subscribeDirty(dirtyId, (dirtyValue) => {
      if (dirtyValue === undefined) setLocalDraftValue(undefined);
      setCurrentValue(dirtyValue);
    });
  }, [dirtyId]);

  const { schema: currentPathSchema, value: currentPathValue } = useMemo(() => {
    const importedValue =
      currentValue === undefined
        ? undefined
        : onImport
        ? onImport(currentValue, fullSchema)
        : currentValue;
    const { schema, value } = drillSchemaValue(fullSchema, importedValue, path);
    return { schema, value };
  }, [fullSchema, currentValue, path, onImport]);

  useEffect(() => {
    if (!isActive) setLocalDraftValue(undefined);
  }, [isActive]);
  const localPathValue =
    isActive && localDraftValue !== undefined
      ? localDraftValue
      : currentPathValue;
  const pathSchema =
    currentPathSchema === undefined ? savedPathSchema : currentPathSchema;
  const pathValue =
    localPathValue === undefined ? savedPathValue : localPathValue;

  function onPathValue(value: any) {
    setLocalDraftValue(value);
    const prevEntryValue =
      currentDirtyId === dirtyId ? getDirtyValue(dirtyId) : savedValue;
    const updatedValue = path.length
      ? mergeValue(prevEntryValue, path, value)
      : value;
    claimDirty(dirtyId, updatedValue);
  }

  return {
    pathValue,
    pathSchema,
    onPathValue,
    isDirty,
    getDirty: () => {
      return getDirtyValue(dirtyId);
    },
    releaseDirty: () => {
      setLocalDraftValue(undefined);
      releaseDirty(dirtyId);
    },
  };
}
