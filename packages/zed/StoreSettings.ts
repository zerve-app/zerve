import { FromSchema } from "json-schema-to-ts";
import { BooleanSchema } from "./JSONSchema";

export const StoreSettingsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    enabledSchemas: {
      type: "object",
      additionalProperties: false,
      properties: {
        HumanText: BooleanSchema,
      },
    },
  },
} as const;

export type StoreSettings = FromSchema<typeof StoreSettingsSchema>;

export const AllExperimentalSchemas = ["HumanText"] as const;
