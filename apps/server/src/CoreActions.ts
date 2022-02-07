import { JSONSchema } from "json-schema-to-ts";

export function defineAction(options: { payloadDefinition: JSONSchema }) {
  return {
    ...options,
  };
}
