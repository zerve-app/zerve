import { FromSchema, ZObservable } from "@zerve/core";
import React, { useEffect, useState } from "react";

export function useZObservable<Schema>(
  observable: ZObservable<Schema>
): FromSchema<Schema> {
  const [state, setState] = useState<FromSchema<Schema>>(observable.get());
  useEffect(() => {
    function updater(v: FromSchema<Schema>) {
      setState(v);
    }
    return observable.subscribe(updater);
  }, [observable]);
  return state;
}

export function useZObservableMaybe<Schema>(
  observable?: null | ZObservable<Schema>
): FromSchema<Schema> | undefined {
  const [state, setState] = useState<undefined | FromSchema<Schema>>(
    observable?.get() || undefined
  );
  useEffect(() => {
    setState(observable?.get() || undefined);
    function updater(v: FromSchema<Schema>) {
      setState(v);
    }
    return observable?.subscribe(updater);
  }, [observable]);
  return state;
}
