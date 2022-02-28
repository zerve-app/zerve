import { TreeState } from "@zerve/core";
import Ajv from "ajv";
import { JSONSchema, FromSchema } from "json-schema-to-ts";

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
