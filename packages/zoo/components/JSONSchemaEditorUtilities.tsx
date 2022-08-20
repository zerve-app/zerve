import { SchemaStore } from "@zerve/core";
import { useContext, useMemo } from "react";
import {
  JSONSchemaEditorContext,
  OverrideFieldComponents,
} from "./JSONSchemaEditor";

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
