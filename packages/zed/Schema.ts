// import { JSONSchema } from "json-schema-to-ts";

import { SchemaStore } from "./Validate";
import { isEmptySchema, ZSchema } from "./JSONSchema";
import { JSONSchema } from "json-schema-to-ts";

export function getDefaultSchemaValue(
  schema: JSONSchema,
  schemaStore?: SchemaStore,
): any {
  if (isEmptySchema(schema)) return null;
  if (schema === true) return null;
  if (schema === false) return null;
  let usableSchema = schema;
  if (schema.$ref) {
    const refSchema = Object.values(schemaStore || {}).find(
      (s) => s.$id === schema.$ref,
    );
    if (refSchema) {
      usableSchema = refSchema;
    } else {
      throw new Error("Schema Ref not Found");
    }
  }
  if (usableSchema.default) return usableSchema.default; // maybe this should be validated? idk.
  if (usableSchema.const !== undefined) return usableSchema.const;
  if (usableSchema.type === "null") return null;
  if (usableSchema.type === "boolean") return false;
  if (usableSchema.type === "number") return 0;
  if (usableSchema.type === "integer") return 0;
  if (usableSchema.type === "string") return "";
  if (usableSchema.type === "array") return []; // todo: handle tuples..
  if (usableSchema.type === "object") {
    const required = new Set(usableSchema.required || []);
    return Object.fromEntries(
      Object.entries(usableSchema.properties || {})
        .filter(([propertyName]) => required.has(propertyName))
        .map(([propertyName, propertySchema]) => {
          if (propertyName === "$key") return [propertyName, generateKey()];
          return [
            propertyName,
            getDefaultSchemaValue(propertySchema, schemaStore),
          ];
        }),
    );
  }
  if (usableSchema.oneOf) {
    return getDefaultSchemaValue(usableSchema.oneOf[0], schemaStore);
  }
  throw new Error("Cannot find a default value for this schema");
}

export function generateKey() {
  const length = 6;
  return (Math.random().toString(36) + "00000000000000000").slice(
    2,
    length + 2,
  );
}

export function ensureUniqueValueKeys(
  value: unknown,
  schema: ZSchema,
): unknown {
  let actualValue = value;
  let hasChanged = false;
  if (schema.type === "array" && Array.isArray(value)) {
    const usedKeys = new Set();
    let newArray = value.map((childValue, childIndex) => {
      if (
        childValue !== null &&
        typeof childValue === "object" &&
        !Array.isArray(childValue)
      ) {
        const definedKey = childValue.Key || childValue.key;
        let internalKey = definedKey || childValue.$key;
        if (!internalKey) internalKey = generateKey();
        if (definedKey && definedKey[0] === "$") {
          throw new Error("Key cannot start with $");
        }
        if (definedKey && usedKeys.has(definedKey)) {
          throw new Error(`Can not define duplicate key "${definedKey}"`);
        }
        while (usedKeys.has(internalKey)) {
          internalKey = generateKey();
        }
        usedKeys.add(internalKey);
        if (childValue.$key === internalKey) return childValue;
        hasChanged = true;
        return { ...childValue, $key: internalKey };
      } else {
        const key = `$index${childIndex}`;
        usedKeys.add(key);
        return childValue;
      }
    });
    newArray = newArray.map((childValue) => {
      const newChild = ensureUniqueValueKeys(childValue, schema.items);
      if (newChild !== childValue) {
        hasChanged = true;
        return newChild;
      } else return childValue;
    });
    if (hasChanged) return newArray;
    else return value;
  }
  if (schema.type === "object" && value !== null && typeof value === "object") {
    if (schema.properties["$key"]) {
      if (typeof value.$key !== "string") {
        hasChanged = true;
        actualValue = { ...value, $key: generateKey() };
      }
    }
    const newObj = Object.fromEntries(
      Object.entries(actualValue).map(([childKey, childValue]) => {
        const childSchema =
          schema.properties[childKey] || schema.additionalProperties;
        const ensuredChildValue = ensureUniqueValueKeys(
          childValue,
          childSchema,
        );
        if (ensuredChildValue !== childValue) {
          hasChanged = true;
          return [childKey, ensuredChildValue];
        } else return [childKey, childValue];
      }),
    );
    if (hasChanged) return newObj;
    return value;
  }
  return value;
}
