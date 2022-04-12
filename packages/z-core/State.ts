import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { createZObservable, ZObservable } from "./Observable";
import { createZAction, createZContainer, ZAction, ZContainer } from "./Zed";

export function createZState<Schema extends JSONSchema>(
  schema: Schema,
  initialState: FromSchema<Schema>
): ZContainer<{
  state: ZObservable<Schema>;
  set: ZAction<Schema, { type: "null" }>;
}> {
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
    }
  );

  const set = createZAction<Schema, { type: "null" }>(
    schema,
    { type: "null" },
    async (v) => {
      internalState = v;
      handlers.forEach((handler) => handler(v));
      return null;
    }
  );

  // This seems to be a bug from TS
  return createZContainer({ state, set }) as any;
}
