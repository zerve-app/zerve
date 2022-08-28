import { createZGettable, StringSchema } from "@zerve/zed";
import { Command } from "@zerve/system-commands";

export const DiskUsage = createZGettable(
  {
    type: "object",
    properties: { usage: StringSchema },
  } as const,
  async () => {
    const { out: usage } = await Command.call({
      command: "df",
      args: ["-h", "/"],
    });

    return { usage };
  },
);
