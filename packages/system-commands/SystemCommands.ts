import { createZAction, NumberSchema, StringSchema } from "@zerve/zed";
import { execFile } from "child_process";

const CommandPayloadSchema = {
  type: "object",
  properties: {
    command: { type: "string", description: "Command to run" },
    args: {
      type: "array",
      items: {
        type: "string",
      },
    },
    cwd: StringSchema,
    env: { type: "object", additionalProperties: StringSchema },
  },
  required: ["command", "args"],
  additionalProperties: false,
} as const;

export const Command = createZAction(
  CommandPayloadSchema,
  {
    type: "object",
    properties: { out: StringSchema, err: StringSchema },
    required: ["out"],
    additionalProperties: false,
  } as const,
  async (action) => {
    return await new Promise((resolve, reject) => {
      execFile(
        action.command,
        action.args || [],
        {
          cwd: action.cwd,
          env: {
            HOME: process.env.HOME,
            USER: process.env.USER,
            SHELL: process.env.SHELL,
            PATH: process.env.PATH,
            ...(action.env || {}),
          },
        },
        (error, out, err) => {
          if (error) reject(error);
          else resolve({ out, err });
        },
      );
    });
  },
);

export const TryCommand = createZAction(
  CommandPayloadSchema,
  {
    type: "object",
    properties: {
      out: StringSchema,
      err: StringSchema,
      responseCode: NumberSchema,
    },
    required: ["out", "err", "responseCode"],
    additionalProperties: false,
  } as const,
  async (action) => {
    return await new Promise((resolve, reject) => {
      execFile(
        action.command,
        action.args || [],
        {
          cwd: action.cwd,
          env: {
            HOME: process.env.HOME,
            USER: process.env.USER,
            SHELL: process.env.SHELL,
            PATH: process.env.PATH,
            ...(action.env || {}),
          },
        },
        (error, out, err) => {
          const responseCode = error?.code || 0;
          resolve({ out, err, responseCode });
        },
      );
    });
  },
);
