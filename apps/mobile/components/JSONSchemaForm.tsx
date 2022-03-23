import React, { useMemo } from "react";
import { JSONSchema } from "@zerve/core";
import {
  Button,
  InfoRow,
  Input,
  Label,
  Paragraph,
  SwitchInput,
  ThemedText,
  Dropdown,
} from "@zerve/ui";

import { NavigationContext, useNavigation } from "@react-navigation/native";
import { KeyboardAvoidingView } from "react-native";

// function JSONSchemaForm({value, onValue, schema}: {value: any, onValue: (v: any)=> void, schema: JSONSchema}) {
//   return null;
// }

function extractTypeSchema(type, schemaObj) {
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

function expandSchema(schema: JSONSchema): JSONSchema | undefined {
  if (schema === false) return undefined;
  if (schema === undefined) return undefined;
  let schemaObj = schema;
  if (schemaObj === true) schemaObj = {};
  const { type } = schemaObj;
  if (
    schemaObj.oneOf ||
    schemaObj.anyOf ||
    schemaObj.allOf ||
    schemaObj.not ||
    schemaObj.const ||
    schemaObj.enum
  ) {
    // composed schemas cannot really be expanded, they kind of already are. theoretically we should do some "factoring" here. eg: if we have a union of two strings we can factor out type: string to the top level.
    // also, "allOf" can be collapsed, and "not" can be pre-evaluated
    return schemaObj;
  }
  if (type == null) {
    // any!
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

  return schema;
}

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
  console.log('SHIT', properties, propertyKeys)
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

const defaultArrayItemsSchema = {} as const;

export function JSONSchemaArrayForm({
  value,
  onValue,
  schema,
}: {
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
}) {
  const expandedItemsSchema = useMemo(
    () => expandSchema(schema.items || defaultArrayItemsSchema),
    [schema.items]
  );
  console.log('BUSTED', {expandedItemsSchema})
  if (!Array.isArray(value))
    return <ThemedText>Value is not an array</ThemedText>;
  return (
    <>
      {value.length === 0 && <ThemedText>List is empty.</ThemedText>}
      {value.map((childValue, childValueIndex) => {
        return (
          <FormField
            label={`#${childValueIndex}`}
            key={childValueIndex}
            value={childValue}
            schema={expandedItemsSchema}
            onValue={
              onValue
                ? (childV) => {
                    const newValue = [...value];
                    newValue[childValueIndex] = childV;
                    onValue(newValue);
                  }
                : undefined
            }
          />
        );
      })}
      {!!onValue && (
        <Button
          onPress={() => {
            onValue([...value, null]);
          }}
          title="Add"
        />
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

function EnumFormField({
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
  if (!onValue) {
    return <InfoRow label={label} value={value} />;
  }
  return (
    <>
      <Label>{label}</Label>
      <Dropdown
        value={value}
        onOptionSelect={onValue}
        options={schema.enum.map((optionValue) => ({
          title: String(optionValue),
          value: optionValue,
        }))}
      />
      {schema.description && <Paragraph>{schema.description}</Paragraph>}
    </>
  );
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
  const expandedSchema = useMemo(() => expandSchema(schema), [schema]);

  console.log('FAILED', {schema})


  if (isLeafType(expandedSchema.type)) {
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
  if (expandedSchema.oneOf) {
    const unionOptions = inspectUnionSchema(expandedSchema);
    const matched = unionOptions.match(value);
    const matchedSchema = expandedSchema.oneOf[matched];
  console.log('SHIT matchedSchema', matchedSchema)

    return (
      <>
        <Label>{label}</Label>
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
          <FormField
            label={matched == null ? "?" : unionOptions.options[matched].title}
            value={value}
            onValue={onValue}
            schema={matchedSchema}
          />
        )}
      </>
    );
  }
  if (schema.enum) {
    return (
      <EnumFormField
        value={value}
        schema={schema}
        label={label}
        onValue={onValue}
      />
    );
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
          disabled={!onValue}
          value={value}
          onValue={onValue}
          label={schema.title || label}
          placeholder={schema.placeholder}
        />
        {description}
      </>
    );
  }
  if (schema.type === "number" || schema.type === "integer") {
    const defaultNumber = schema.default || 0;
    return (
      <Input
        disabled={!onValue}
        keyboardType={schema.type === "integer" ? "number-pad" : "numeric"}
        value={value == null ? String(defaultNumber) : String(value)}
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
        disabled={!onValue}
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
  // "integer", // LOL because we can't infer the difference between this and a number
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
        if (optionSchema.type === "integer") return optionSchema.default || 0;
        if (optionSchema.type === "boolean")
          return optionSchema.default || false;
        if (optionSchema.type === "array") return []; // fix to handle array schemas such as tuples that require default values?
        if (optionSchema.type === "object") {
          // todo provide defaults that are specified here in the schema
          return { ...unionConstProperties[optionSchemaIndex] };
        }
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
  const expandedSchema = useMemo(() => expandSchema(schema), [schema]);
  if (!expandedSchema) {
    return <ThemedText>Value not allowed.</ThemedText>;
  }

  if (expandedSchema.oneOf) {
    const unionOptions = inspectUnionSchema(expandedSchema);
    const matched = unionOptions.match(value);
    const matchedSchema = expandedSchema.oneOf[matched];
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
  if (expandedSchema.anyOf) {
    return <ThemedText>anyOf schema unsupported</ThemedText>;
  }
  if (expandedSchema.type === "array") {
    return (
      <JSONSchemaArrayForm value={value} onValue={onValue} schema={schema} />
    );
  }
  if (expandedSchema.type === "object") {
    return (
      <JSONSchemaObjectForm value={value} onValue={onValue} schema={schema} />
    );
  }
  if (isLeafType(expandedSchema.type)) {
    return (
      <LeafFormField
        label={expandedSchema?.title || expandedSchema.type}
        value={value}
        onValue={onValue}
        schema={schema}
      />
    );
  }
  if (expandedSchema.enum) {
    return (
      <EnumFormField
        label={expandedSchema?.title || expandedSchema.type || "enum"}
        value={value}
        onValue={onValue}
        schema={schema}
      />
    );
  }

  return <ThemedText>Failed to create form for this schema</ThemedText>;
}
