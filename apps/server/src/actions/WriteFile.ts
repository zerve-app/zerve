import { FromSchema } from "json-schema-to-ts";

import { defineAction } from "../CoreActions";

const payloadSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
    value: {
      type: "string",
    },
  },
} as const;

export type WriteFileAction = FromSchema<typeof payloadSchema>;

export const WriteFile = defineAction({
  payloadSchema,
});
