import { createZAction, StringSchema } from "@zerve/core";
import { execFile } from "child_process";

export const Command = createZAction(
  {
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
  } as const,
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
