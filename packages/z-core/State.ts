import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { createZObservable } from "./Observable";
import { createZAction, createZContainer } from "./Zed";

export function createZState<Schema extends JSONSchema>(
  schema: Schema,
  initialState: FromSchema<Schema>
) {
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
  const set = createZAction(
    schema,
    { type: "null" } as const,
    (v: FromSchema<Schema>) => {
      internalState = v;
      handlers.forEach((handler) => handler(v));
    }
  );
  return createZContainer({
    state,
    set,
  });
}
