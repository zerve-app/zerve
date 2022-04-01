import {
  createZAction,
  createZContainer,
  createZStatic,
  RequestError,
} from "@zerve/core";
import { writeFile, stat, readdir, readFile, mkdirp, move } from "fs-extra";
import { join } from "path";

function ensureNoPathEscape(path: string) {
  if (path.match(/^\.\./) || path.match(/\/\.\./)) {
    throw new RequestError(
      "PathValidationError",
      `Cannot use .. within your path`,
      { path }
    );
  }
}

export type SystemFilesModule = ReturnType<typeof createSystemFiles>;

export function createSystemFiles<FilesRoot extends string>(
  filesRoot: FilesRoot
) {
  const WriteFile = createZAction(
    {
      type: "object",
      required: ["path", "value"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
        value: { type: "string" },
      },
    } as const,
    { type: "null" } as const,

    async ({ path, value }) => {
      ensureNoPathEscape(path);
      await writeFile(join(filesRoot, path), value);
      return null;
    }
  );

  const WriteJSON = createZAction(
    {
      type: "object",
      required: ["path", "value"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
        value: {},
      },
    } as const,
    { type: "null" } as const,
    async ({ path, value }) => {
      ensureNoPathEscape(path);
      const fullPath = join(filesRoot, path);
      await writeFile(fullPath, JSON.stringify(value));
      return null;
    }
  );

  const ReadFile = createZAction(
    {
      type: "object",
      required: ["path"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
      },
    } as const,
    { type: "string" } as const,
    async ({ path }) => {
      ensureNoPathEscape(path);
      const fullPath = join(filesRoot, path);
      return await readFile(fullPath, { encoding: "utf8" });
    }
  );

  const ReadJSON = createZAction(
    {
      type: "object",
      required: ["path"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
      },
    } as const,
    {} as const,
    async ({ path }) => {
      ensureNoPathEscape(path);
      const fullPath = join(filesRoot, path);
      try {
        const data = await readFile(fullPath, { encoding: "utf8" });
        return JSON.parse(data);
      } catch (e: any) {
        if (e.code === "ENOENT") {
          return undefined;
        } else throw e;
      }
    }
  );

  const ReadDir = createZAction(
    {
      type: "object",
      required: ["path"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
      },
    } as const,
    { type: "array", items: { type: "string" } } as const,
    async ({ path }) => {
      ensureNoPathEscape(path);
      const fullPath = join(filesRoot, path);
      const result = await readdir(fullPath);
      return result;
    }
  );

  const MakeDir = createZAction(
    {
      type: "object",
      required: ["path"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
      },
    } as const,
    { type: "null" } as const,
    async ({ path }) => {
      ensureNoPathEscape(path);
      const fullPath = join(filesRoot, path);
      await mkdirp(fullPath);
      return null;
    }
  );

  const Move = createZAction(
    {
      type: "object",
      required: ["path"],
      additionalProperties: false,
      properties: {
        from: { type: "string" },
        to: { type: "string" },
      },
    } as const,
    { type: "null" } as const,
    async ({ from, to }) => {
      ensureNoPathEscape(from);
      ensureNoPathEscape(to);
      const fullFrom = join(filesRoot, from);
      const fullTo = join(filesRoot, to);
      await move(fullFrom, fullTo);
      return null;
    }
  );

  const Stat = createZAction(
    {
      type: "object",
      required: ["path"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
      },
    } as const,
    {
      type: "object",
      additionalProperties: false,
      properties: {
        path: { type: "string" },
        isDirectory: { type: "boolean" },
      },
      required: ["path", "isDirectory"],
    } as const,
    async ({ path }) => {
      ensureNoPathEscape(path);
      const fullPath = join(filesRoot, path);
      const stats = await stat(fullPath);
      return { path, isDirectory: stats.isDirectory() };
    }
  );

  return createZContainer({
    WriteFile,
    ReadFile,
    Stat,
    ReadDir,
    MakeDir,
    WriteJSON,
    ReadJSON,
    Move,
    Path: createZStatic(filesRoot),
  });
}
