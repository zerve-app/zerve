import { FromSchema, JSONSchema } from "json-schema-to-ts";

export type ZObservable<Schema extends JSONSchema> = {
  zType: "Observable";
  valueSchema: Schema;
  get: () => FromSchema<Schema>;
  subscribe: (handler: (v: FromSchema<Schema>) => void) => () => void;
};

export function createZObservable<Schema extends JSONSchema>(
  valueSchema: Schema,
  get: () => FromSchema<Schema>,
  subscribe: (handler: (v: FromSchema<Schema>) => void) => () => void
): ZObservable<Schema> {
  return { zType: "Observable", get, valueSchema, subscribe };
}
