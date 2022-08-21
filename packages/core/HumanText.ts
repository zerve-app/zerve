import { BooleanSchema, StringSchema } from "./JSONSchema";

export const HumanTextSchema = {
  $id: "https://type.zerve.link/HumanText",
  title: "HumanText",
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    properties: {
      text: StringSchema,
      bold: BooleanSchema,
      italic: BooleanSchema,
      strike: BooleanSchema,
      underline: BooleanSchema,
      code: BooleanSchema,
      linkHref: StringSchema,
    },
    required: ["text"],
  },
} as const;
