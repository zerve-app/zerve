// from this file we export OUR OWN CUSTOM JSON-SCHEMA.
// the Zerve JSON schema defined in this file is a subset of all JSON-schema, and also a superset that enhances the UI and extends zerve functionality

import { FromSchema } from "json-schema-to-ts";

const TitleSchema = {
  type: "string",
} as const;
const DescriptionSchema = {
  type: "string",
} as const;

// the metadata that can accompany ANY schema
const SchemaMeta = {
  title: TitleSchema,
  description: DescriptionSchema,
} as const;

export const NullSchemaSchema = {
  type: "object",
  title: "Empty",
  properties: {
    type: { const: "null" },
    ...SchemaMeta,
  },
  required: ["type"],
  additionalProperties: false,
} as const;
export type NullSchema = FromSchema<typeof NullSchemaSchema>;
export const NullSchema = {
  type: "null",
} as const;

export const NumberSchemaSchema = {
  type: "object",
  title: "Number",
  properties: {
    type: { const: "number" },
    ...SchemaMeta,
    default: { type: "number" }, // uhh this implies the need of a more powerful generic/recursion o_O. Like {$ref:'#'}
  },
  required: ["type"],
  additionalProperties: false,
} as const;
export type NumberSchema = FromSchema<typeof NumberSchemaSchema>;

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

export const StringSchemaSchema = {
  type: "object",
  title: "Text",
  properties: {
    type: { const: "string" },
    ...SchemaMeta,
    default: { type: "string" }, // uhh this implies the need of a more powerful generic/recursion o_O
    placeholder: { type: "string" },
    capitalize: CapitalizeSchema,
  },
  required: ["type"],
  additionalProperties: false,
} as const;
export type ZStringSchema = FromSchema<typeof StringSchemaSchema>;

export const BooleanSchemaSchema = {
  type: "object",
  title: "Switch",
  properties: {
    type: { const: "boolean" },
    ...SchemaMeta,
    default: { type: "boolean" }, // uhh this implies the need of a more powerful generic/recursion o_O
  },
  required: ["type"],
  additionalProperties: false,
} as const;
export type ZBooleanSchema = FromSchema<typeof BooleanSchemaSchema>;

export const ConstSchemaSchema = {
  type: "object",
  title: "Static Value",
  properties: {
    const: {
      type: ["string", "boolean", "number"],
    },
  },
  additionalProperties: false,
  required: ["const"],
} as const;

export const RefSchemaSchema = {
  title: "Ref",
  type: "object",
  properties: {
    ...SchemaMeta,
    $ref: { type: "string" },
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
  oneOf: [
    ...PrimitiveSchemaSchema.oneOf,
    // ConstSchemaSchema // disabled for now because the union dropdown broken when selecting object type
  ],
} as const;
export type LeafSchema = FromSchema<typeof LeafSchemaSchema>;

export const FalseSchema = { const: false, title: "Disabled" } as const;
export const TrueSchema = { const: true } as const;

export const ObjectSchemaSchema = {
  title: "Object",
  type: "object",
  properties: {
    type: { const: "object" },
    ...SchemaMeta,
    properties: {
      type: "object",
      additionalProperties: LeafSchemaSchema,
    },
    additionalProperties: {
      title: "Additional Properties",
      oneOf: [FalseSchema, ...LeafSchemaSchema.oneOf],
    } as const,
    required: { type: "array", items: { type: "string" } },
  },
  required: [
    "type",
    //"properties",
    "additionalProperties",
  ],
  additionalProperties: false,
  default: {
    // uhh this implies the need of a more powerful generic/recursion o_O
    type: "object",
  },
} as const;

export const ArraySchemaSchema = {
  title: "List",
  type: "object",
  properties: {
    type: { const: "array" },
    ...SchemaMeta,
    items: LeafSchemaSchema,
    default: {
      type: "array",
    }, // uhh this implies the need of a more powerful generic/recursion o_O
  },
  required: ["type"],
  additionalProperties: false,
} as const;

export const ZSchemaSchema = {
  oneOf: [
    ObjectSchemaSchema,
    ArraySchemaSchema,
    NullSchemaSchema,
    BooleanSchemaSchema,
    // IntegerSchemaSchema,
    NumberSchemaSchema,
    StringSchemaSchema,
    // ConstSchemaSchema, // disabled for now because the union dropdown broken when selecting object type
  ],
} as const;

export type ZSchema = FromSchema<typeof ZSchemaSchema>;
