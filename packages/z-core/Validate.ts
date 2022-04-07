import Ajv from "ajv";
import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { ZSchema } from "./JSONSchema";
import { RequestError } from "./Errors";

export const ajv = new Ajv();

const rareNonObjectSchemaValidatorMap = new Map();
const schemaValidatorMap = new WeakMap<ZSchema, Ajv.ValidateFunction>();

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
    console.error(validate.errors);
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

export type SchemaStore = Record<string, ZSchema>;

const schemaStoreValidatorMapMap = new WeakMap<
  SchemaStore,
  WeakMap<ZSchema, Ajv.ValidateFunction>
>(); // if this works it is the coolest variable in the codebase. look at that type!

function getSchemaStoreValidator(
  schema: any,
  validatorMap: WeakMap<ZSchema, Ajv.ValidateFunction>,
  schemaStore: SchemaStore
) {
  const schemasAjv = new Ajv();
  Object.entries(schemaStore).forEach(([schemaName, schema]) => {
    console.log("lmfao?", schemaName, schema);
    schemasAjv.addSchema(
      {
        ...schema,
        $id: `https://type.zerve.link/${schemaName}`, // theoretically $id should be a url-looking thing but this seems more practical for now...
      },
      `https://type.zerve.link/${schemaName}`
    );
  });
  if (typeof schema !== "object" || schema === null) {
    if (rareNonObjectSchemaValidatorMap.has(schema))
      return rareNonObjectSchemaValidatorMap.get(schema);
    const validator = schemasAjv.compile(schema);
    rareNonObjectSchemaValidatorMap.set(schema, validator);
    return validator;
  } else {
    if (validatorMap.has(schema)) return validatorMap.get(schema);
    const validator = schemasAjv.compile(schema);
    validatorMap.set(schema, validator);
    return validator;
  }
}

export function validateWithSchemaStore<Schema extends JSONSchema>(
  schema: Schema,
  value: any,
  schemaStore: SchemaStore
): FromSchema<Schema> {
  if (!schemaStoreValidatorMapMap.has(schemaStore)) {
    schemaStoreValidatorMapMap.set(
      schemaStore,
      new WeakMap<ZSchema, Ajv.ValidateFunction>()
    );
  }
  const validatorMap = schemaStoreValidatorMapMap.get(schemaStore);
  if (!validatorMap)
    throw new Error(
      "validatorMap should be here in schemaStoreValidatorMapMap by now"
    );
  const validate = getSchemaStoreValidator(schema, validatorMap, schemaStore);
  const isValid = validate(value);
  if (!isValid) {
    console.error(validate.errors);
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
