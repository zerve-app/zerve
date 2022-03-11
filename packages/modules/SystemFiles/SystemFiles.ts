import {
  createZAction,
  createZGroup,
  createZGettable,
  createZContainer,
  ZGettable,
} from "@zerve/core";
import { join } from "path";
import { writeFile, stat, readdir, readFile } from "fs-extra";

const rootPath = "/";

const WriteFile = createZAction(
  {
    type: "object",
    required: ["name", "value"],
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      value: { type: "string" },
    },
  } as const,
  async (info) => {
    await writeFile(join(info.name, info.name), info.value);
  }
);

const Stat = createZAction(
  {
    type: "object",
    required: ["name"],
    additionalProperties: false,
    properties: {
      name: { type: "string" },
    },
  } as const,
  async (info) => {
    const stats = await stat(join(rootPath, info.name));
    return { name: info.name, isDirectory: stats.isDirectory() };
  }
);

const FileZotValueSchema = {
  type: "object",
} as const;

function prepareFileZot(
  path: string
): ZGettable<typeof FileZotValueSchema, undefined> {
  return createZGettable({ type: "string" }, async () => {
    const stats = await stat(path);
    if (stats.isDirectory()) {
      return { type: "directory", children: await readdir(path) };
    } else {
      return {
        type: "file",
        value: await readFile(path, { encoding: "utf8" }),
      };
    }
  });
}

const Files = createZGroup(async (filePath: string) => {
  return prepareFileZot(filePath);
});

const SystemFiles = createZContainer({ WriteFile, Stat, Files });

export default SystemFiles;
