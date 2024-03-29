import Ajv from "ajv";
import { _, KeywordCxt, Options } from "ajv";
import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { getListItemKey, ZSchema } from "./JSONSchema";
import { RequestError } from "./Errors";

const AJV_OPTIONS: Options = {
  //strict: true, // fails when using "discriminator" field as documented by ajv! https://ajv.js.org/json-schema.html#discriminator
  allErrors: true,
  discriminator: true,
};

export const ajv = new Ajv(AJV_OPTIONS);

const ExtraPatternsMetaSchema = {
  type: "object",
  additionalProperties: { type: "string" },
} as const;

// ignore extra form/schema fields:
ajv.addKeyword("propertyTitles");
ajv.addKeyword("inputType");
ajv.addKeyword("placeholder");
ajv.addKeyword("submitLabel");
ajv.addKeyword("submitIcon");
ajv.addKeyword("$z");

ajv.addKeyword({
  keyword: "extraPatterns",
  type: "string",
  metaSchema: ExtraPatternsMetaSchema,
  validate: function validateExtraPatterns(
    schema: FromSchema<typeof ExtraPatternsMetaSchema>,
    data: string,
    _parentSchema: any,
    context:
      | {
          instancePath: string;
        }
      | undefined,
  ) {
    let isValid = true;
    validateExtraPatterns.errors = Object.entries(schema)
      .map(([patternRegexp, patternError]) => {
        if (!data.match(new RegExp(patternRegexp))) {
          isValid = false;
          return {
            keyword: "extraPatterns",
            message: patternError,
            params: { pattern: patternRegexp },
            instancePath: context?.instancePath,
          };
        }
        return null;
      })
      .filter((err) => !!err);
    return isValid;
  },
});

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
  value: any,
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
      },
    );
  }
  return value;
}

export type SchemaStore = Record<string, ZSchema>;

export const EmptySchemaStore: SchemaStore = {} as const;

const schemaStoreValidatorMapMap = new WeakMap<
  SchemaStore,
  WeakMap<ZSchema, Ajv.ValidateFunction>
>(); // if this works it is the coolest variable in the codebase. look at that type!

function getSchemaStoreValidator(
  schema: any,
  validatorMap: WeakMap<ZSchema, Ajv.ValidateFunction>,
  schemaStore: SchemaStore,
) {
  const schemasAjv = new Ajv(AJV_OPTIONS);
  schemasAjv.addKeyword("propertyTitles"); // no errors
  schemasAjv.addKeyword("$z"); // no errors
  Object.entries(schemaStore).forEach(([schemaName, schema]) => {
    schemasAjv.addSchema(
      {
        ...schema,
        $id: `https://type.zerve.link/${schemaName}`, // theoretically $id should be a url-looking thing but this seems more practical for now...
      },
      `https://type.zerve.link/${schemaName}`,
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

export type ValidationError = {
  instancePath: string; // like /0/key
  schemaPath: string; // like 'https://type.zerve.link/SchemaName/required',
  keyword: string; // 'required', 'listKey'
  params: unknown; // eg { missingProperty: 'ok' },
  message: string;
};

export function validateListKeys(
  value: unknown,
  contextPath: string[] = [],
): ValidationError[] {
  if (Array.isArray(value)) {
    let errors: ValidationError[] = [];
    const allKeysSoFar = new Set();
    value.forEach((childValue, childValueIndex) => {
      const key = getListItemKey(childValue, childValueIndex);
      if (allKeysSoFar.has(key)) {
        errors.push({
          instancePath: `/${(contextPath || []).join("/")}/${childValueIndex}`,
          schemaPath: "", // hmm, hope we dont need this later!
          keyword: "duplicateKey",
          params: {
            key,
            index: childValueIndex,
            contextPath,
          },
          message: `duplicate key "${key}"`,
        });
      }
      allKeysSoFar.add(key);
      validateListKeys(childValue, [
        ...contextPath,
        String(childValueIndex),
      ]).forEach((error) => errors.push(error));
    });
    return errors;
  } else if (value === null) {
    return [];
  } else if (typeof value === "object") {
    let errors: ValidationError[] = [];
    Object.entries(value).forEach(([childValueKey, childValue]) => {
      if (childValueKey === "$key") return;
      validateListKeys(childValue, [...contextPath, childValueKey]).forEach(
        (error) => errors.push(error),
      );
    });
    return errors;
  }
  return [];
}

export function validateWithSchemaStore<Schema extends JSONSchema>(
  schema: Schema,
  value: any,
  schemaStore: SchemaStore,
): FromSchema<Schema> {
  if (!schemaStoreValidatorMapMap.has(schemaStore)) {
    schemaStoreValidatorMapMap.set(
      schemaStore,
      new WeakMap<ZSchema, Ajv.ValidateFunction>(),
    );
  }
  const validatorMap = schemaStoreValidatorMapMap.get(schemaStore);
  if (!validatorMap)
    throw new Error(
      "validatorMap should be here in schemaStoreValidatorMapMap by now",
    );
  const validate = getSchemaStoreValidator(schema, validatorMap, schemaStore);
  const isValid = validate(value);
  const arrayValidationErrors = validateListKeys(value);
  const validationErrors = [
    ...(isValid ? [] : (validate.errors as unknown as ValidationError[])),
    ...arrayValidationErrors,
  ];
  if (validationErrors.length) {
    throw new RequestError(
      "ValidationError",
      `Invalid: ${validationErrors.map((e) => e.message).join(", ")}`,
      {
        errors: validationErrors,
      },
    );
  }
  return value;
}
