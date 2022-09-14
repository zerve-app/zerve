// from this file we export OUR OWN CUSTOM JSON-SCHEMA.
// the Zerve JSON schema defined in this file is a subset of all JSON-schema, and also a superset that enhances the UI and extends zerve functionality

import { FromSchema, JSONSchema } from "json-schema-to-ts";

export const TitleSchema = {
  title: "Text",
  type: "string",
} as const;
export const DescriptionSchema = {
  title: "Text",
  type: "string",
} as const;

export const IDSchema = {
  title: "ID",
  type: "string",
  pattern: "^([0-9a-z])([0-9a-z_])*([0-9a-z])$",
} as const;

export const EntryNameSchema = {
  title: "Entry Name",
  type: "string",
  pattern: "^([0-9A-Z])([0-9a-zA-Z_])*([0-9a-zA-Z])$",
} as const;

// the metadata that can accompany ANY schema
const SchemaMeta = {
  title: TitleSchema,
  description: DescriptionSchema,
} as const;

const SchemaMetaTitles = {
  title: "Title",
  description: "Description",
} as const;

export const NullSchemaSchema = {
  type: "object",
  title: "Empty",
  properties: {
    type: { const: "null", title: "Empty" },
    ...SchemaMeta,
  },
  propertyTitles: {
    ...SchemaMetaTitles,
    type: "Type",
  },
  required: ["type"],
  additionalProperties: false,
} as const;
export type NullSchema = FromSchema<typeof NullSchemaSchema>;
export const NullSchema = {
  type: "null",
} as const;

export function isEmptySchema(schema: JSONSchema) {
  if (schema === undefined) return true;
  if (schema === true) return false;
  if (schema === false) return true;
  if (schema.type === "null") return true;
  return false;
}

export function getListItemKey(value: unknown, valueIndex: number): string {
  if (value === null) return `Item ${valueIndex}`;
  if (typeof value === "object") {
    if (typeof value.Key === "string") return value.Key;
    if (typeof value.key === "string") return value.key;
    if (typeof value.$key === "string") return value.$key;
  }
  return `Item ${valueIndex}`;
}

export const NumberSchemaSchema = {
  type: "object",
  title: "Number Schema",
  properties: {
    type: { const: "number", title: "Number" },
    ...SchemaMeta,
    default: { type: "number", title: "Number" }, // uhh this implies the need of a more powerful generic/recursion o_O. Like {$ref:'#'}
  },
  propertyTitles: {
    ...SchemaMetaTitles,
    type: "Type",
    default: "Default",
  },
  required: ["type"],
  additionalProperties: false,
} as const;
export type NumberSchema = FromSchema<typeof NumberSchemaSchema>;
export const NumberSchema = {
  type: "number",
} as const;

// export const IntegerSchemaSchema = {
//   type: "object",
//   title: "Number (Integer)",
//   properties: {
//     type: { const: "integer" },
//     ...SchemaMeta,
//     default: { type: "integer" }, // uhh this implies the need of a more powerful generic/recursion o_O
//   },
//   required: ["type"],
//   additionalProperties: false,
// } as const;
// export type ZIntegerSchema = FromSchema<typeof IntegerSchemaSchema>;

export const CapitalizeSchema = {
  enum: ["characters", "words", "sentences", "none"],
  default: "none",
} as const;

const TextInputTypeSchemaSchema = {
  oneOf: [
    { const: "default" },
    { const: "numeric" },
    { const: "email-address" },
    { const: "ascii-capable" },
    { const: "numbers-and-punctuation" },
    { const: "url" },
    { const: "number-pad" },
    { const: "phone-pad" },
    { const: "name-phone-pad" },
    { const: "decimal-pad" },
    { const: "twitter" },
    { const: "web-search" },
    { const: "password" },
    { const: "visible-password" },
  ],
} as const;
export type ZTextInputType = FromSchema<typeof TextInputTypeSchemaSchema>;

export const StringSchemaSchema = {
  type: "object",
  title: "Text Schema",
  properties: {
    type: { const: "string", title: "String" },
    ...SchemaMeta,
    default: { type: "string" }, // uhh this implies the need of a more powerful generic/recursion o_O
    placeholder: { type: "string" },
    inputType: TextInputTypeSchemaSchema,
    capitalize: CapitalizeSchema,
  },
  propertyTitles: {
    ...SchemaMetaTitles,
    type: "Type",
    default: "Default",
    placeholder: "Placeholder",
    inputType: "Keyboard Type",
    capitalize: "Auto-Caps",
  },
  default: {
    type: "string",
    title: "Text",
  },
  required: ["type"],
  additionalProperties: false,
} as const;
export type ZStringSchema = FromSchema<typeof StringSchemaSchema>;
export const StringSchema = {
  type: "string",
} as const;

export const BooleanSchemaSchema = {
  type: "object",
  title: "Switch Schema",
  properties: {
    type: { const: "boolean" },
    ...SchemaMeta,
    default: { type: "boolean", title: "Switch" },
  },
  propertyTitles: {
    ...SchemaMetaTitles,
    type: "Type",
    default: "Default",
  },
  required: ["type"],
  additionalProperties: false,
} as const;
export type ZBooleanSchema = FromSchema<typeof BooleanSchemaSchema>;
export const BooleanSchema = {
  type: "boolean",
} as const;

export const ConstSchemaSchema = {
  type: "object",
  title: "Static Value",
  properties: {
    const: {
      type: ["string", "boolean", "number"],
    },
    ...SchemaMeta,
  },
  additionalProperties: false,
  required: ["const"],
  propertyTitles: {
    ...SchemaMetaTitles,
    const: "Constant Value",
  },
} as const;

export const RefSchemaSchema = {
  title: "Schema Reference",
  type: "object",
  properties: {
    $ref: { type: "string", title: "Reference" },
    ...SchemaMeta,
  },
  propertyTitles: {
    $ref: "Schema",
    ...SchemaMetaTitles,
  },
  required: ["$ref"],
  additionalProperties: false,
} as const;
export type ZRefSchema = FromSchema<typeof RefSchemaSchema>;

export const PrimitiveSchemaSchema = {
  oneOf: [
    NullSchemaSchema,
    BooleanSchemaSchema,
    // IntegerSchemaSchema,
    NumberSchemaSchema,
    StringSchemaSchema,
  ],
} as const;
export type PrimitiveSchema = FromSchema<typeof PrimitiveSchemaSchema>;

export const LeafSchemaSchema = {
  title: "Schema",
  oneOf: [
    ...PrimitiveSchemaSchema.oneOf,
    // ConstSchemaSchema // disabled for now because the union dropdown broken when selecting object type
  ],
} as const;
export type LeafSchema = FromSchema<typeof LeafSchemaSchema>;

export const DisabledSchema = { const: false, title: "Disabled" } as const;
export const TrueSchema = { const: true } as const;

export const ObjectSchemaSchema = {
  title: "Object Schema",
  type: "object",
  properties: {
    type: { const: "object", title: "Object" },
    properties: {
      title: "Object Properties",
      type: "object",
      additionalProperties: LeafSchemaSchema,
      default: {},
    },
    additionalProperties: {
      ...LeafSchemaSchema,
      title: "Object Additional Properties",
      oneOf: [DisabledSchema, ...LeafSchemaSchema.oneOf],
    } as const,
    ...SchemaMeta,
    propertyTitles: {
      description:
        "The keys match the Properties, and the values act as override titles",
      type: "object",
      additionalProperties: { type: "string" },
    } as const,
    required: { type: "array", items: { type: "string" } },
  },
  propertyTitles: {
    type: "Type",
    properties: "Properties",
    additionalProperties: "Additional Properties",
    ...SchemaMetaTitles,
    required: "Required Properties",
    propertyTitles: "Property Titles",
  },
  required: ["type", "properties", "additionalProperties"],
  additionalProperties: false,
  default: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
} as const;

export const ArraySchemaSchema = {
  title: "List Schema",
  type: "object",
  properties: {
    type: { const: "array", title: "List" },
    ...SchemaMeta,
    items: LeafSchemaSchema,
    default: {
      type: "array",
    },
  },
  required: ["type", "items"],
  additionalProperties: false,
  propertyTitles: {
    ...SchemaMetaTitles,
    type: "Type",
    items: "Items",
    default: "Default",
  },
} as const;

export const ZSchemaSchema = {
  oneOf: [
    NullSchemaSchema,
    ObjectSchemaSchema,
    ArraySchemaSchema,
    StringSchemaSchema,
    BooleanSchemaSchema,
    // IntegerSchemaSchema,
    NumberSchemaSchema,
    // ConstSchemaSchema, // disabled for now because the union dropdown broken when selecting object type
  ],
} as const;

export type ZSchema = FromSchema<typeof ZSchemaSchema>;
