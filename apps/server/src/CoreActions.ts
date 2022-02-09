import Ajv from "ajv";
import { JSONSchema } from "json-schema-to-ts";
import { FromSchema } from "json-schema-to-ts";

const ajv = new Ajv();

export function defineAction<S extends JSONSchema>(options: {
  payloadSchema: S;
}) {
  type Payload = FromSchema<S>;

  const validate = ajv.compile(options.payloadSchema);

  return {
    ...options,
    validate,
    call: (p: Payload) => {
      console.log("ok, 'doing' the action!!!", p);
    },
  };
}
