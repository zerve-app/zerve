// from this file we export OUR OWN CUSTOM JSON-SCHEMA.
// the Zerve JSON schema defined in this file is a subset of all JSON-schema, and also a superset that enhances the UI and extends zerve functionality

import { FromSchema } from "json-schema-to-ts";

export const NullSchemaSchema = {
  type: "object",
  properties: {
    type: { const: "null" },
    description: { const: "string" },
    title: { const: "string" },
  },
  additionalProperties: false,
} as const;
export type NullSchema = FromSchema<typeof NullSchemaSchema>;

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

export const NumberSchemaSchema = {
  type: "object",
  properties: {
    type: { const: "number" },
    default: { type: "number" }, // uhh this implies the need of a more powerful generic/recursion o_O. Like {$ref:'#'}
    ...SchemaMeta,
  },
  required: ["type"],
  additionalProperties: false,
} as const;
export type NumberSchema = FromSchema<typeof NumberSchemaSchema>;

export const IntegerSchemaSchema = {
  type: "object",
  properties: {
    type: { const: "integer" },
    ...SchemaMeta,
    default: { type: "integer" }, // uhh this implies the need of a more powerful generic/recursion o_O
  },
  additionalProperties: false,
} as const;
export type ZIntegerSchema = FromSchema<typeof IntegerSchemaSchema>;

export const CapitalizeSchema = {
  enum: ["characters", "words", "sentences", "none"],
  default: "none",
} as const;

export const StringSchemaSchema = {
  type: "object",
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
  properties: {
    type: { const: "boolean" },
    ...SchemaMeta,
    default: { type: "boolean" }, // uhh this implies the need of a more powerful generic/recursion o_O
  },
  additionalProperties: false,
} as const;
export type ZBooleanSchema = FromSchema<typeof BooleanSchemaSchema>;

export const LeafSchemaSchema = {
  oneOf: [
    NullSchemaSchema,
    BooleanSchemaSchema,
    IntegerSchemaSchema,
    NumberSchemaSchema,
    StringSchemaSchema,
  ],
} as const;
export type LeafSchema = FromSchema<typeof LeafSchemaSchema>;

export const ZSchemaSchema = {
  oneOf: [
    NullSchemaSchema,
    BooleanSchemaSchema,
    IntegerSchemaSchema,
    NumberSchemaSchema,
    StringSchemaSchema,
  ],
} as const;

export type ZSchema = FromSchema<typeof ZSchemaSchema>;
