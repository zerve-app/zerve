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
    },
    required: ["text"],
  },
} as const;
