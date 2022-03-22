import React from "react";
import { JSONSchema } from "@zerve/core";
import {
  Button,
  InfoRow,
  Input,
  Label,
  Paragraph,
  SwitchInput,
  ThemedText,
} from "@zerve/ui";
import { Dropdown } from "./Dropdown";
import { NavigationContext, useNavigation } from "@react-navigation/native";

// function JSONSchemaForm({value, onValue, schema}: {value: any, onValue: (v: any)=> void, schema: JSONSchema}) {
//   return null;
// }

export function JSONSchemaObjectForm({
  value,
  onValue,
  schema,
}: {
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
}) {
  const { properties, additionalProperties } = schema;
  const errors: { message: string }[] = [];
  if (typeof value !== "object")
    errors.push({ message: "Value is not an object" });
  const propertyKeys = new Set(
    properties == null ? [] : Object.keys(properties)
  );
  const otherKeys = value
    ? Object.keys(value).filter((p) => !propertyKeys.has(p))
    : [];
  return (
    <>
      {schema.description ? <Paragraph>{schema.description}</Paragraph> : null}
      {!!errors.length && (
        <Paragraph>Errors: {errors.map((e) => e.message).join(". ")}</Paragraph>
      )}
      {[...propertyKeys].map((propertyName) => (
        <FormField
          key={propertyName}
          value={value?.[propertyName]}
          schema={properties[propertyName]}
          label={propertyName}
          onValue={
            onValue
              ? (propertyValue) =>
                  onValue({ ...value, [propertyName]: propertyValue })
              : undefined
          }
        />
      ))}
      {otherKeys.map((itemName) => (
        <FormField
          key={itemName}
          value={value?.[itemName]}
          schema={additionalProperties}
          label={itemName}
          onValue={
            onValue
              ? (propertyValue) =>
                  onValue({ ...value, [itemName]: propertyValue })
              : undefined
          }
        />
      ))}
      {additionalProperties !== false && !!onValue && (
        <Button onPress={() => {}} title="Add" />
      )}
    </>
  );
}
function ObjectFormField({
  label,
  value,
  onValue,
  schema,
}: {
  label: string;
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
}) {
  const { navigate } = useNavigation();
  return (
    <>
      <Label>{label}</Label>
      <Button
        title={(JSON.stringify(value) || "").slice(0, 60)}
        onPress={() => {
          navigate("JSONInput", { schema, value, onValue });
        }}
      />
    </>
  );
}
function ArrayFormField({
  label,
  value,
  onValue,
  schema,
}: {
  label: string;
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
}) {
  return <ThemedText>Array support coming soon</ThemedText>;
}

export function FormField({
  label,
  value,
  onValue,
  schema,
}: {
  label: string;
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
}) {
  if (isLeafType(schema.type)) {
    return (
      <LeafFormField
        value={value}
        schema={schema}
        label={label}
        onValue={onValue}
      />
    );
  }
  if (schema.const) {
    return <InfoRow label={label} value={JSON.stringify(value)} />;
  }
  if (schema.type === "object") {
    return (
      <ObjectFormField
        value={value}
        schema={schema}
        label={label}
        onValue={onValue}
      />
    );
  }

  if (schema.type === "array") {
    return (
      <ArrayFormField
        value={value}
        schema={schema}
        label={label}
        onValue={onValue}
      />
    );
  }

  return (
    <ThemedText>Unhandled Child Schema: {JSON.stringify(schema)}</ThemedText>
  );
}

export function LeafFormField({
  label,
  value,
  onValue,
  schema,
}: {
  label: string;
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
}) {
  const description = schema.description ? (
    <Paragraph>{schema.description}</Paragraph>
  ) : null;
  if (schema.type === "string") {
    return (
      <>
        <Input
          value={value}
          onValue={onValue}
          label={schema.title || label}
          placeholder={schema.placeholder}
        />
        {description}
      </>
    );
  }
  if (schema.type === "number") {
    return (
      <Input
        disabled={!onValue}
        value={String(value)}
        onValue={
          onValue ? (valueString) => onValue(Number(valueString)) : undefined
        }
        label={schema.title || label}
      />
    );
  }
  if (schema.type === "boolean") {
    return (
      <SwitchInput
        value={value}
        onValue={onValue}
        label={schema.title || label}
      />
    );
  }
  return null;
}

const allTypesList = [
  "boolean",
  "string",
  "integer",
  "number",
  "null",
  "array",
  "object",
] as const;

function getTypeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function inspectUnionSchema(schema) {
  // schema has oneOf and we need to understand how children are differentiated
  const optionSchemas = schema.oneOf;
  const aggregateTypeOptions = new Set([]);
  const distinctTypeOptions = new Set([]);

  optionSchemas.forEach((optionSchema) => {
    if (typeof optionSchema.type !== "string") {
      console.log("optionSchema", optionSchema);
      throw new Error(
        "cannot handle a union/anyOf with complicated children types"
      );
    }
    const { type } = optionSchema;
    if (distinctTypeOptions.has(type)) {
      distinctTypeOptions.delete(type);
      aggregateTypeOptions.add(type);
    } else if (!aggregateTypeOptions.has(type)) {
      distinctTypeOptions.add(type);
    }
  });

  const unionKeys: string[] = [];
  const unionKeyMap = {};

  const unionConstProperties = optionSchemas.map(
    (optionSchema, optionSchemaIndex) => {
      const constProperties = {};
      Object.entries(optionSchema.properties || {}).forEach(
        ([childPropName, childPropSchema]) => {
          if (childPropSchema.const !== undefined) {
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
  unionConstProperties.forEach((constProperties, optionSchemaIndex) => {
    let walkKeyMap = unionKeyMap;
    unionKeys.forEach((unionKey, unionKeyIndex) => {
      const isLastUnionKey = unionKeyIndex === unionKeys.length - 1;
      const constValue = constProperties[unionKey];
      const isLeaf = isLastUnionKey || constValue === undefined;
      const newNodeValue = isLeaf ? optionSchemaIndex : {};
      const thisKeyMap =
        walkKeyMap[constValue] || (walkKeyMap[constValue] = newNodeValue);
      walkKeyMap = thisKeyMap;
    });
  });

  const isAlwaysObject =
    aggregateTypeOptions.size === 1 &&
    distinctTypeOptions.size === 0 &&
    aggregateTypeOptions.values().next().value === "object";

  function getTitle(optionSchema, optionSchemaIndex) {
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
  return {
    options: optionSchemas.map((optionSchema, optionSchemaIndex) => {
      return {
        title: optionSchema.title || getTitle(optionSchema, optionSchemaIndex),
        value: optionSchemaIndex,
      };
    }),
    converters: optionSchemas.map((optionSchema, optionSchemaIndex) => {
      return (v: any) => {
        if (optionSchema.type === "null") return null;
        if (optionSchema.type === "string") return optionSchema.default || "";
        if (optionSchema.type === "number") return optionSchema.default || 0;
        if (optionSchema.type === "boolean")
          return optionSchema.default || false;
        if (optionSchema.type === "array") return []; // fix to handle array schemas such as tuples that require default values?
        if (optionSchema.type === "object")
          return { ...unionConstProperties[optionSchemaIndex] };
      };
    }),
    match: (value: any) => {
      const observedValueType = getTypeOf(value);
      if (distinctTypeOptions.has(observedValueType)) {
        // this means that we can use the type to find a specific schema.
        const matchedIndex = optionSchemas.findIndex(
          (schema) => schema.type === observedValueType
        );
        if (matchedIndex === -1)
          throw new Error("Failed to match oneOf schema via distinct type");
        return matchedIndex;
      }
      if (value === null) return null;
      if (typeof value === "object") {
        let walkingKeyMap = unionKeyMap;
        unionKeys.forEach((unionKey) => {
          const theValue = value[unionKey];
          walkingKeyMap = walkingKeyMap[theValue];
        });
        return walkingKeyMap;
      }
      return null;
    },
  };
}

function isLeafType(v: string) {
  return (
    v === "null" ||
    v === "string" ||
    v === "number" ||
    v === "boolean" ||
    v === "integer"
  );
}

export function JSONSchemaForm({
  value,
  onValue,
  schema,
}: {
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
}) {
  if (schema === false) return null;
  let objSchema = schema;
  if (schema === true) objSchema = {};
  const type = schema?.type || allTypesList;
  let onlyType = Array.isArray(type) ? null : type;
  if (!onlyType && type.length === 1) {
    onlyType = type[0];
  }
  if (schema.oneOf) {
    const unionOptions = inspectUnionSchema(schema);
    const matched = unionOptions.match(value);
    const matchedSchema = schema.oneOf[matched];
    return (
      <>
        <Dropdown
          options={unionOptions.options}
          value={matched}
          onOptionSelect={(optionValue) => {
            const converter = unionOptions.converters[optionValue];
            const convertedValue = converter(value);
            onValue(convertedValue);
          }}
        />
        {matchedSchema != null && (
          <JSONSchemaForm
            value={value}
            onValue={onValue}
            schema={matchedSchema}
          />
        )}
      </>
    );
  }
  if (schema.anyOf) {
    return <ThemedText>anyOf schema unsupported</ThemedText>;
  }
  if (onlyType === "array") {
    return <ThemedText>array schema unsupported lol</ThemedText>;
  }
  if (onlyType === "object") {
    return (
      <JSONSchemaObjectForm value={value} onValue={onValue} schema={schema} />
    );
  }
  if (isLeafType(onlyType)) {
    return (
      <LeafFormField
        label={objSchema?.title || onlyType}
        value={value}
        onValue={onValue}
        schema={schema}
      />
    );
  }
  return null;
}
