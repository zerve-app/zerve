import Ajv from "ajv";
import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { RequestError } from ".";

export const ajv = new Ajv();

const rareNonObjectSchemaValidatorMap = new Map();
const schemaValidatorMap = new WeakMap();

export function getValidatorOfSchema(schema: any) {
  if (typeof schema !== "object" || schema === null) {
    if (rareNonObjectSchemaValidatorMap.has(schema))
      return rareNonObjectSchemaValidatorMap.get(schema);
    const validator = ajv.compile(schema);
    rareNonObjectSchemaValidatorMap.set(schema, validator);
    return validator;
  } else {
    if (schemaValidatorMap.has(schema)) return schemaValidatorMap.get(schema);
    const validator = ajv.compile(schema);
    schemaValidatorMap.set(schema, validator);
    return validator;
  }
}

export function validateWithSchema<Schema extends JSONSchema>(
  schema: Schema,
  value: any
): FromSchema<Schema> {
  const validate = getValidatorOfSchema(schema);
  const isValid = validate(value);
  if (!isValid) {
    throw new RequestError(
      "ValidationError",
      `Invalid: ${validate.errors[0].message}`,
      {
        errors: validate.errors,
      }
    );
  }
  return value;
}
