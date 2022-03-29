import Ajv from "ajv";

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
