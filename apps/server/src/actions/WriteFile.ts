import { FromSchema } from "json-schema-to-ts";

import { defineAction, emptyTreeState } from "../CoreActions";

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
  handler: (state = emptyTreeState, payload) => {
    if (!payload.name) return state;
    return {
      ...state,
      children: {
        ...state.children,
        [payload.name]: {
          type: "Block",
          jsonValue: payload.value,
        },
      },
    };
  },
});
