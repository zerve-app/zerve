import Ajv from "ajv";
import { JSONSchema } from "json-schema-to-ts";
import { FromSchema } from "json-schema-to-ts";

export type BlockLink = {
  type: "BlockLink";
  id: string;
};
export type Block = {
  type: "Block";
  jsonValue: any;
};

export type TreeState<V> = {
  value: V;
  children: Record<string, Block | BlockLink>;
};

const ajv = new Ajv();

export function defineAction<S extends JSONSchema>(options: {
  payloadSchema: S;
  handler: (
    state: TreeState<any>,
    actionPayload: FromSchema<S>
  ) => TreeState<any>;
}) {
  const validate = ajv.compile(options.payloadSchema);
  return {
    ...options,
    handler: options.handler,
    validate,
  };
}

export const emptyTreeState: TreeState<any> = {
  value: null,
  children: {},
};
