import {
  defineActionZot,
  defineContainerZot,
  defineGetZot,
  defineStaticContainerZot,
} from "@zerve/core";
import { join } from "path";
import { writeFile, stat, readdir, readFile } from "fs-extra";

const makeFiles = defineContainerZot(
  (rootPath: string) => (filePath: string) => {
    return defineGetZot({ type: "string" }, async () => {
      const path = join(rootPath, filePath);
      const stats = await stat(path);
      if (stats.isDirectory()) {
        return { type: "directory", children: await readdir(path) };
      } else {
        return { type: "file", value: await readFile(path, {encoding: 'utf8'}) };
      }
    });
  }
);

const SystemFiles = defineStaticContainerZot(
  ({ rootPath }: { rootPath: string }) => {
    const WriteFile = defineActionZot(
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

    const Stat = defineActionZot(
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

    const Files = makeFiles(rootPath);

    return { WriteFile, Stat, Files };
  }
);

export default SystemFiles;
