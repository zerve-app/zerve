import {
  createZAction,
  createZContainer,
  createZGroup,
  StringSchema,
} from "@zerve/core";
import { execFile } from "child_process";

export type SystemCommandsModule = ReturnType<typeof createSystemCommands>;

export function createSystemCommands() {
  const commandZMap = new Map();

  // const commands = createZGroup(async (commandName) => {
  //   if (commandZMap.has(commandName)) return commandZMap.get(commandName);
  //   const command = createZAction(
  //     {
  //       type: "object",
  //       properties: {
  //         args: {
  //           type: "array",
  //           items: {
  //             type: "string",
  //           },
  //         },
  //       },
  //       required: ["args"],
  //       additionalProperties: false,
  //     } as const,
  //     {
  //       type: "object",
  //       properties: { out: {}, err: {} },
  //       required: ["out"],
  //       additionalProperties: false,
  //     } as const,
  //     async ({ args }) => {
  //       return await new Promise((resolve, reject) => {
  //         execFile(commandName, args, {}, (error, out, err) => {
  //           if (error) reject(error);
  //           else resolve({ out, err });
  //         });
  //       });
  //     }
  //   );
  //   commandZMap.set(commandName, command);
  //   return command;
  // });

  const command = createZAction(
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
          }
        );
      });
    }
  );

  return createZContainer({
    command,
  });
}
