import { JSONSchema } from "json-schema-to-ts";
import { JSONSchema7 } from "json-schema-to-ts/lib/definitions";

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

function getDefaultValueOfSchema(schema: JSONSchema) {
  console.log("getDefaultV", schema);
  if (typeof schema !== "object")
    throw new Error("cannot get default of non-object schema");
  if (schema.default) return schema.default;
  if (schema.const !== undefined) return schema.const;
  if (schema.type === "null") return null;
  if (schema.type === "string") return "";
  if (schema.type === "number") return 0;
  if (schema.type === "integer") return 0;
  if (schema.type === "boolean") return false;
  if (schema.type === "array") return []; // fix to handle array schemas such as tuples that require default values?
  if (schema.type === "object") {
    const objDefaults = {};
    if (schema.properties) {
      Object.entries(schema.properties).forEach(
        ([propertyName, propertySchema]) => {
          objDefaults[propertyName] = getDefaultValueOfSchema(propertySchema);
        }
      );
    }
    console.log("see!", schema, objDefaults);
    return objDefaults;
  }
}

type CalculatedUnionOption = {
  title: string;
  value: string;
};

export function exploreUnionSchema(schema: JSONSchema): {
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
        "cannot handle a union/anyOf with complicated children types"
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
            childPropSchema.const !== undefined
          ) {
            constProperties[childPropName] = childPropSchema.const;
          }
        }
      );
      Object.keys(constProperties).forEach((keyName) => {
        if (unionKeys.indexOf(keyName) === -1) unionKeys.push(keyName);
      });
      return constProperties;
    }
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
    }
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
    }
  );
  return {
    options,
    converters: optionSchemas.map((optionSchema, optionSchemaIndex) => {
      return (v: any) => {
        if (!optionSchema) return null;
        return getDefaultValueOfSchema(optionSchema);
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
            typeof schema === "object" && schema.type === observedValueType
        );
        if (matchedIndex === -1)
          throw new Error("Failed to match oneOf schema via distinct type");
        return String(matchedIndex);
      }
      if (value === null) return null;
      if (typeof value === "object") {
        let walkingKeyMap = unionKeyMap || {};
        unionKeys.forEach((unionKey) => {
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
        throw new Error("const key map contains unexpected value");
      }
      return null;
    },
  };
}
