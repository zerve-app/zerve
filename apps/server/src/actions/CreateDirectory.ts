import { FromSchema } from "json-schema-to-ts";

import { defineAction, emptyTreeState } from "../CoreActions";

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
  handler: (state = emptyTreeState, payload) => {
    if (!payload.name) return state;
    console.log("hellooo CreateDirectory", payload.name);
    return {
      ...state,
      children: {
        ...state.children,
        [payload.name]: {
          type: "Block",
          jsonValue: {
            type: "Directory",
            children: {},
          },
        },
      },
    };
  },
});
