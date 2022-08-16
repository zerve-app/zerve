import { createZGettable, StringSchema } from "@zerve/core";
import { Command } from "@zerve/system-commands";

export const DiskUsage = createZGettable(
  {
    type: "object",
    properties: { usage: StringSchema },
  } as const,
  async () => {
    const { out: usage } = await Command.call({
      command: "du",
      args: ["-h", "/"],
    });

    return { usage };
  }
);
