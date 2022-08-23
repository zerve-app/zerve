import {
  FieldComponentProps,
  FromSchema,
  JSONSchema,
  SchemaStore,
} from "@zerve/core";
import { createContext, useContext, useMemo } from "react";

export type FieldComponent<
  FieldSchema extends JSONSchema,
  InternalValue,
> = React.FC<FieldComponentProps<FieldSchema>> & {
  import?: (value: FromSchema<FieldSchema>) => InternalValue;
  export?: (internalValue: InternalValue) => FromSchema<FieldSchema>;
};

export type OverrideFieldComponents = Record<string, FieldComponent<any, any>>;

type JSONSchemaEditorContext = {
  OverrideFieldComponents?: OverrideFieldComponents;
};
export const JSONSchemaEditorContext = createContext<JSONSchemaEditorContext>(
  {},
);

export function getValueImport(
  OverrideFieldComponents: OverrideFieldComponents | undefined,
) {
  function importNode(v: any, schema: JSONSchema) {
    const OverrideComponent =
      OverrideFieldComponents?.[schema.$id] ||
      OverrideFieldComponents?.[schema.$ref];
    if (OverrideComponent?.import) return OverrideComponent.import(v);
    if (schema.type === "array" && Array.isArray(v)) {
      const itemsSchema = schema.items;
      return v.map((node) => importNode(node, itemsSchema));
    }
    if (schema.type === "object" && typeof v === "object") {
      return Object.fromEntries(
        Object.entries(v).map(([key, childValue]) => [
          key,
          importNode(
            childValue,
            schema.properties[key] || schema.additionalProperties,
          ),
        ]),
      );
    }
    return v;
  }
  return importNode;
}

export function getValueExport(
  OverrideFieldComponents: OverrideFieldComponents | undefined,
) {
  function exportNode(v: any, schema: JSONSchema) {
    const OverrideComponent =
      OverrideFieldComponents?.[schema.$id] ||
      OverrideFieldComponents?.[schema.$ref];
    if (OverrideComponent?.export) return OverrideComponent.export(v);
    if (schema.type === "array" && Array.isArray(v)) {
      const itemsSchema = schema.items;
      return v.map((node) => exportNode(node, itemsSchema));
    }
    if (schema.type === "object" && typeof v === "object") {
      return Object.fromEntries(
        Object.entries(v).map(([key, childValue]) => [
          key,
          exportNode(
            childValue,
            schema.properties[key] || schema.additionalProperties,
          ),
        ]),
      );
    }
    return v;
  }
  return exportNode;
}

export function useValueImporter(schemaStore: SchemaStore) {
  const { OverrideFieldComponents } = useContext(JSONSchemaEditorContext);
  const importer = useMemo(
    () => getValueImport(OverrideFieldComponents),
    [OverrideFieldComponents],
  );
  return importer;
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
