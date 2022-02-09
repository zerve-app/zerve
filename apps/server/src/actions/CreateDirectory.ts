import { FromSchema } from "json-schema-to-ts";

import { defineAction } from "../CoreActions";

const payloadSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
  },
} as const;

export type CreateDirectoryAction = FromSchema<typeof payloadSchema>;

export const CreateDirectory = defineAction({
  payloadSchema,
});
