import { JSONSchema } from "json-schema-to-ts";
import { JSONSchema7 } from "json-schema-to-ts/lib/definitions";
import { getDefaultSchemaValue } from "./Schema";
import { EmptySchemaStore, SchemaStore } from "./Validate";

export const AllJSONSchemaTypes = [
  "string",
  "number",
  "integer",
  "boolean",
  "object",
  "array",
  "null",
] as const;
export type AllJSONSchemaType =
  typeof AllJSONSchemaTypes[keyof typeof AllJSONSchemaTypes];

function getTypeOf(jsonValue: any): AllJSONSchemaType {
  if (jsonValue === null) return "null";
  if (Array.isArray(jsonValue)) return "array";
  const typeofJsonValue = typeof jsonValue;
  if (typeofJsonValue === "object") return "object";
  if (typeofJsonValue === "string") return "string";
  if (typeofJsonValue === "number") return "number";
  if (typeofJsonValue === "boolean") return "boolean";
  throw new Error("Cannot get JSON type of: " + jsonValue);
}

type CalculatedUnionOption = {
  title: string;
  value: string;
};

export function exploreUnionSchema(
  schema: JSONSchema,
  schemaStore: SchemaStore,
): {
  match: (v: any) => string | null;
  options: CalculatedUnionOption[];
  converters: ((v: any) => any)[];
} {
  if (typeof schema !== "object" || !schema.oneOf)
    throw new Error("Cannot exploreUnionSchema without schema .oneOf");
  // schema has oneOf and we need to understand how children are differentiated
  const optionSchemas = schema.oneOf;
  const aggregateTypeOptions = new Set<AllJSONSchemaType>([]);
  const distinctTypeOptions = new Set<AllJSONSchemaType>([]);
  optionSchemas.forEach((optionSchema: JSONSchema, index: number) => {
    if (!optionSchema || typeof optionSchema !== "object") {
      return;
    }
    let type: AllJSONSchemaType = optionSchema?.type;
    if (!type && optionSchema?.const !== undefined) {
      type = typeof optionSchema?.const;
    }
    if (!type) {
      throw new Error(
        "cannot handle a union/anyOf with complicated children types",
      );
    }
    if (distinctTypeOptions.has(type)) {
      distinctTypeOptions.delete(type);
      aggregateTypeOptions.add(type);
    } else if (!aggregateTypeOptions.has(type)) {
      distinctTypeOptions.add(type);
    }
  });

  const unionKeys: string[] = [];
  const unionConstMap = new Map<any, string>();

  const unionConstProperties = optionSchemas.map(
    (optionSchema: JSONSchema, optionSchemaIndex: number) => {
      if (!optionSchema || typeof optionSchema !== "object") return {};
      if (optionSchema.const != null) {
        unionConstMap.set(optionSchema.const, String(optionSchemaIndex));
        return null;
      }
      const constProperties = {};
      if (optionSchema.type !== "object") return {};

      Object.entries(optionSchema.properties || {}).forEach(
        ([childPropName, childPropSchema]) => {
          if (
            typeof childPropSchema === "object" &&
            childPropSchema.const !== undefined &&
            optionSchema.required?.indexOf(childPropName) !== -1
          ) {
            constProperties[childPropName] = childPropSchema.const;
          }
        },
      );
      Object.keys(constProperties).forEach((keyName) => {
        if (unionKeys.indexOf(keyName) === -1) unionKeys.push(keyName);
      });
      return constProperties;
    },
  );

  const unionKeyMap = {};
  unionConstProperties.forEach(
    (constProperties: null | {}, optionSchemaIndex) => {
      let walkKeyMap = unionKeyMap;
      unionKeys.forEach((unionKey, unionKeyIndex) => {
        const isLastUnionKey = unionKeyIndex === unionKeys.length - 1;
        const constValue = constProperties?.[unionKey];
        const newNodeValue = isLastUnionKey ? optionSchemaIndex : {};
        const thisKeyMap =
          walkKeyMap[constValue] || (walkKeyMap[constValue] = newNodeValue);
        walkKeyMap = thisKeyMap;
      });
    },
  );

  const isAlwaysObject =
    aggregateTypeOptions.size === 1 &&
    distinctTypeOptions.size === 0 &&
    aggregateTypeOptions.values().next().value === "object";

  function getTitle(optionSchema: JSONSchema, optionSchemaIndex: nmber) {
    if (typeof optionSchema !== "object") return "?";
    if (optionSchema.const !== undefined) {
      return `${optionSchema.const}`;
    }
    if (
      optionSchema.type === "object" &&
      optionSchema?.properties?.title?.const
    ) {
      return optionSchema?.properties?.title?.const;
    }
    const constsValue = unionKeys
      .map((unionKey) => {
        const value = unionConstProperties[optionSchemaIndex][unionKey];
        if (value === undefined) return false;
        return `${unionKey}: ${value}`;
      })
      .filter(Boolean)
      .join(", ");
    if (isAlwaysObject) return constsValue;
    return `${optionSchema.type} ${constsValue}`;
  }
  const options = optionSchemas.map(
    (optionSchema, optionSchemaIndex: number) => {
      return {
        title:
          typeof optionSchema === "object"
            ? optionSchema.title || getTitle(optionSchema, optionSchemaIndex)
            : "?",
        value: String(optionSchemaIndex),
      };
    },
  );
  return {
    options,
    converters: optionSchemas.map((optionSchema, optionSchemaIndex) => {
      return (v: any) => {
        if (!optionSchema) return null;
        return getDefaultSchemaValue(optionSchema, schemaStore);
      };
    }),
    match: (value: any): null | string => {
      if (value === undefined) return null;
      const constValueMatch = unionConstMap.get(value);
      if (constValueMatch) return constValueMatch;
      const observedValueType = getTypeOf(value);
      if (distinctTypeOptions.has(observedValueType)) {
        // this means that we can use the type to find a specific schema.
        const matchedIndex = optionSchemas.findIndex(
          (schema) =>
            typeof schema === "object" && schema.type === observedValueType,
        );
        if (matchedIndex === -1)
          throw new Error("Failed to match oneOf schema via distinct type");
        return String(matchedIndex);
      }
      if (value === null) return null;
      if (typeof value === "object") {
        let walkingKeyMap = unionKeyMap || {};
        unionKeys.forEach((unionKey) => {
          if (!walkingKeyMap) debugger;
          schema;
          value;
          if (typeof walkingKeyMap === "number") return;
          const theValue = value[unionKey];
          const nextWalk =
            walkingKeyMap[theValue] == null
              ? walkingKeyMap["undefined"]
              : walkingKeyMap[theValue];
          walkingKeyMap = nextWalk;
        });
        if (typeof walkingKeyMap === "number") {
          return String(walkingKeyMap);
        }
      }
      return null;
    },
  };
}

export function lookUpValue(value: any, child: string | string[]): any {
  if (Array.isArray(child))
    return child.reduce((prev, oneChild) => lookUpValue(prev, oneChild), value);
  if (value == null)
    throw new Error(`Can not look up "${child}" within empty value.`);
  if (Array.isArray(value)) return value[Number(child)];
  if (typeof value === "object") return value[child];
  throw new Error(
    `Can not look up "${child}" within ${JSON.stringify(value)}.`,
  );
}

export function mergeValue(
  mainValue: any,
  path: string[],
  newChildValue: any,
): any {
  if (path.length === 0) return newChildValue;
  const child = path[0];
  const rest = path.slice(1);
  if (Array.isArray(mainValue)) {
    const childIndex = Number(child);
    if (isNaN(childIndex)) {
      throw new Error(
        `Can not set child "${child}" in array at path "${path.join(".")}".`,
      );
    }
    const newMainValue = Array.from(mainValue);
    newMainValue[childIndex] = mergeValue(
      newMainValue[childIndex],
      rest,
      newChildValue,
    );
    return newMainValue;
  }
  if (typeof mainValue === "object") {
    const newMainValue = { ...mainValue };
    newMainValue[child] = mergeValue(newMainValue[child], rest, newChildValue);
    return newMainValue;
  }
  throw new Error(
    'Can not set child "${child}" in ${JSON.stringify(mainValue)}.`);',
  );
}

export function pathsEqual(path1: string[], path2: string[]) {
  if (path1.length !== path2.length) return false;
  for (let i = 0; i < path1.length; i++) {
    if (path1[i] !== path2[i]) return false;
  }
  return true;
}

export function drillSchemaValue(
  inputSchema: JSONSchema,
  inputValue: unknown,
  path: string[],
) {
  let schema: JSONSchema | undefined = inputSchema;
  let value = inputValue;
  path.forEach((pathTerm) => {
    if (value == null || schema == null) {
      schema = undefined;
      value = undefined;
      // drilling failed, probably because value or schema is not provided
      return;
    }
    if (schema === true) {
      value = lookUpValue(value, pathTerm);
      return;
    }
    if (schema === false)
      throw new Error(`Can not look up "${pathTerm}" within empty schema`);
    if (schema.oneOf) {
      const { match } = exploreUnionSchema(schema, EmptySchemaStore);
      const matched = match(value);
      if (!matched) {
        throw new Error(
          "Can not drill into unmatched schema, yet. Maybe possible to construct oneOf schema if all options have similar properties",
        );
      }
      schema = schema.oneOf[Number(matched)];
    }
    if (typeof schema !== "object") {
      // schema should be an object by now because we detected null,true,false
    } else if (schema.type === "array") {
      value = lookUpValue(value, pathTerm);
      schema = schema.items;
    } else if (schema.type === "object") {
      value = lookUpValue(value, pathTerm);
      schema =
        schema.properties?.[pathTerm] || schema.additionalProperties || false;
    } else {
      throw new Error(`Can not look up "${pathTerm}" in schema`);
    }
  });
  return { schema, value };
}

export function expandSchema(
  schema: JSONSchema,
  schemaStore: SchemaStore,
): JSONSchema {
  if (schema === false) return false;
  let schemaObj = schema;
  if (schemaObj === true) schemaObj = {};
  if (schemaObj.$ref) {
    const refSchema = Object.values(schemaStore || {}).find(
      (s) => s.$id === schemaObj.$ref,
    );
    if (refSchema) {
      schemaObj = refSchema;
    } else {
      console.log("Warning: Schema Ref not found! ", schema.$ref);
    }
  }
  const { type } = schemaObj;
  if (
    schemaObj.oneOf !== undefined ||
    schemaObj.anyOf !== undefined ||
    schemaObj.allOf !== undefined ||
    schemaObj.not !== undefined ||
    schemaObj.const !== undefined ||
    schemaObj.enum !== undefined
  ) {
    // composed schemas cannot really be expanded, they kind of already are. theoretically we should do some "factoring" here. eg: if we have a union of two strings we can factor out type: string to the top level.
    // also, "allOf" can be collapsed, and "not" can be pre-evaluated
    return schemaObj;
  }
  if (type == null) {
    // any! this is sad
    return {
      oneOf: allTypesList.map((subType) => ({ type: subType })),
    };
  }
  if (Array.isArray(type)) {
    if (schema.oneOf) {
      throw new Error("Cannot expand a schema that has types array and oneOf.");
    }
    return {
      oneOf: type.map((subType) => extractTypeSchema(subType, schemaObj)),
    };
  }

  if (type === "object") {
    const properties = schemaObj.properties
      ? Object.fromEntries(
          Object.entries(schemaObj.properties).map(([propName, propSchema]) => [
            propName,
            expandSchema(propSchema, schemaStore),
          ]),
        )
      : schemaObj.properties;
    const additionalProperties = schemaObj.additionalProperties
      ? expandSchema(schemaObj.additionalProperties, schemaStore)
      : schemaObj.additionalProperties;
    return {
      ...schemaObj,
      properties,
      additionalProperties,
    };
  }

  if (type === "array") {
    const items = schemaObj.items
      ? expandSchema(schemaObj.items, schemaStore)
      : schemaObj.items;
    return {
      ...schemaObj,
      items,
    };
  }

  return schemaObj;
}

export const allTypesList = [
  "null",
  "boolean",
  "number",
  "string",
  // "integer", // LOL because we can't infer the difference between this and a number
  "array",
  "object",
] as const;

export function isLeafType(v: string) {
  return (
    v === "null" ||
    v === "string" ||
    v === "number" ||
    v === "boolean" ||
    v === "integer"
  );
}

export function extractTypeSchema(type, schemaObj) {
  const subType = { type };
  if (type === "string") {
    subType.minLength = schemaObj.minLength;
    subType.maxLength = schemaObj.maxLength;
    subType.pattern = schemaObj.pattern;
    subType.format = schemaObj.format;
  } else if (type === "object") {
    subType.required = schemaObj.required;
    subType.properties = schemaObj.properties;
    subType.patternProperties = schemaObj.properties;
    subType.additionalProperties = schemaObj.additionalProperties;
    subType.unevaluatedProperties = schemaObj.unevaluatedProperties;
    subType.propertyNames = schemaObj.propertyNames;
    subType.minProperties = schemaObj.minProperties;
    subType.maxProperties = schemaObj.maxProperties;
  } else if (type === "array") {
    subType.items = schemaObj.items;
    subType.prefixItems = schemaObj.prefixItems;
    subType.contains = schemaObj.contains;
    subType.minContains = schemaObj.minContains;
    subType.maxContains = schemaObj.maxContains;
    subType.uniqueItems = schemaObj.uniqueItems;
    subType.minItems = schemaObj.minItems;
    subType.maxItems = schemaObj.maxItems;
  } else if (type === "integer" || type === "number") {
    subType.minimum = schemaObj.minimum;
    subType.exclusiveMinimum = schemaObj.exclusiveMinimum;
    subType.maximum = schemaObj.maximum;
    subType.exclusiveMaximum = schemaObj.exclusiveMaximum;
    subType.multipleOf = schemaObj.multipleOf;
  }

  return subType;
}
