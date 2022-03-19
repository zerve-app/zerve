import { createZAction, createZContainer, createZGroup } from "@zerve/core";
import { execFile } from "child_process";

export type SystemCommandsModule = ReturnType<typeof createSystemCommands>;

function createSystemCommands() {
  const commandZMap = new Map();

  const commands = createZGroup(async (commandName) => {
    if (commandZMap.has(commandName)) return commandZMap.get(commandName);
    const command = createZAction(
      {
        type: "object",
        properties: {
          args: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: ["args"],
        additionalProperties: false,
      } as const,
      {
        type: "object",
        properties: { out: {}, err: {} },
        required: ["out"],
        additionalProperties: false,
      } as const,
      async ({ args }) => {
        return await new Promise((resolve, reject) => {
          execFile(commandName, args, {}, (error, out, err) => {
            if (error) reject(error);
            else resolve({ out, err });
          });
        });
      }
    );
    commandZMap.set(commandName, command);
    return command;
  });

  return createZContainer({
    commands,
  });
}

const SystemCommands = {
  createSystemCommands,
} as const;

export default SystemCommands;
