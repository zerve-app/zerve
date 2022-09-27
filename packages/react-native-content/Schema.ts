import { FromSchema } from "json-schema-to-ts";

export const BooleanSchema = {
  type: "boolean",
} as const;

export const StringSchema = {
  type: "string",
} as const;

export const HumanTextSchema = {
  $id: "https://type.zerve.link/HumanText",
  title: "HumanText",
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    properties: {
      $key: StringSchema,
      text: StringSchema,
      bold: BooleanSchema,
      italic: BooleanSchema,
      strike: BooleanSchema,
      underline: BooleanSchema,
      code: BooleanSchema,
      linkHref: StringSchema,
    },
    required: ["text", "$key"],
  },
} as const;

export type HumanText = FromSchema<typeof HumanTextSchema>;
