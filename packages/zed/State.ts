import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { NullSchema } from "./JSONSchema";
import { createZObservable, ZObservable } from "./Observable";
import {
  createZAction,
  createZMetaContainer,
  ZAction,
  ZContainer,
} from "./Zed";

const StateContainerContractMeta = { zContract: "State" } as const;

export function createZState<Schema extends JSONSchema>(
  schema: Schema,
  initialState: FromSchema<Schema>,
): ZContainer<
  {
    state: ZObservable<Schema>;
    set: ZAction<Schema, { type: "null" }>;
  },
  typeof StateContainerContractMeta
> {
  let internalState = initialState;
  const handlers = new Set<(s: FromSchema<Schema>) => void>();
  const state = createZObservable<Schema>(
    schema,
    () => internalState,
    (handler) => {
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
      };
    },
  );

  const set = createZAction<Schema, { type: "null" }>(
    schema,
    NullSchema,
    async (v) => {
      internalState = v;
      handlers.forEach((handler) => handler(v));
      return null;
    },
  );

  return createZMetaContainer(
    { state, set },
    StateContainerContractMeta,
  ) as any;
  // This seems to be a bug from TS – @ThomasAribart https://github.com/zerve-app/zerve/pull/2
}
