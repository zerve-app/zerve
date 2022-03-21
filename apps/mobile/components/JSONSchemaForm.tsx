import React from "react";
import { JSONSchema } from "@zerve/core";
import { Input, Paragraph, SwitchInput, ThemedText } from "@zerve/ui";

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
        <JSONSchemaFieldForm
          key={propertyName}
          value={value?.[propertyName]}
          schema={properties[propertyName]}
          label={propertyName}
          onValue={(propertyValue) =>
            onValue({ ...value, [propertyName]: propertyValue })
          }
        />
      ))}
      {otherKeys.map((itemName) => (
        <JSONSchemaFieldForm
          key={itemName}
          value={value?.[itemName]}
          schema={additionalProperties}
          label={itemName}
          onValue={(propertyValue) =>
            onValue({ ...value, [itemName]: propertyValue })
          }
        />
      ))}
      {additionalProperties !== false && !!onValue && (
        <Button onPress={() => {}} title="Add" />
      )}
    </>
  );
}

export function JSONSchemaFieldForm({
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
      <Input value={value} onValue={onValue} label={schema.title || label} />
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
  "number",
  "null",
  "array",
  "object",
] as const;

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
  let onlyType = Array.isArray(type) ? type : null;
  if (!onlyType && type.length === 1) {
    onlyType = type[0];
  }
  if (schema.oneOf) {
    return (
      <>
        {/* <Dropdown options={[]}  */}
        <ThemedText>oneOf coming soon</ThemedText>
      </>
    );
  }
  if (schema.anyOf) {
    return <ThemedText>anyOf schema unsupported</ThemedText>;
  }
  if (onlyType === "array") {
    return <ThemedText>array schema unsupported</ThemedText>;
  }
  if (onlyType === "object") {
    return (
      <JSONSchemaObjectForm value={value} onValue={onValue} schema={schema} />
    );
  }
  if (onlyType === "string") {
    return (
      <JSONSchemaFieldForm
        label={objSchema?.title || "string"}
        value={value}
        onValue={onValue}
        schema={schema}
      />
    );
  }
  return null;
}
