import {
  createZAction,
  RequestError,
  StringSchema,
  BooleanSchema,
  NullSchema,
} from "@zerve/core";
import {
  writeFile,
  stat,
  readdir,
  readFile,
  mkdirp,
  move,
  unlink,
  pathExists,
} from "fs-extra";
import { join } from "path";

export function ensureNoPathEscape(path: string) {
  if (path.match(/^\.\./) || path.match(/\/\.\./)) {
    throw new RequestError(
      "PathValidationError",
      `Cannot use .. within your path`,
      { path }
    );
  }
}

export const joinPath = join;

export const WriteFile = createZAction(
  {
    type: "object",
    required: ["path", "value"],
    additionalProperties: false,
    properties: {
      path: { type: "string" },
      value: { type: "string" },
    },
  } as const,
  NullSchema,
  async ({ path, value }) => {
    await writeFile(path, value);
    return null;
  }
);

export const WriteJSON = createZAction(
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
    await writeFile(path, JSON.stringify(value));
    return null;
  }
);

export const ReadFile = createZAction(
  StringSchema,
  StringSchema,
  async (path) => {
    return await readFile(path, { encoding: "utf8" });
  }
);

export const ReadJSON = createZAction(
  StringSchema,
  {} as const,
  async (path) => {
    try {
      const data = await readFile(path, { encoding: "utf8" });
      return JSON.parse(data);
    } catch (e: any) {
      if (e.code === "ENOENT") {
        return undefined;
      } else throw e;
    }
  }
);

export const ReadDir = createZAction(
  StringSchema,
  { type: "array", items: StringSchema } as const,
  async (path) => {
    const result = await readdir(path);
    return result;
  }
);

export const MakeDir = createZAction(StringSchema, NullSchema, async (path) => {
  await mkdirp(path);
  return null;
});

export const Move = createZAction(
  {
    type: "object",
    required: ["from", "to"],
    additionalProperties: false,
    properties: {
      from: StringSchema,
      to: StringSchema,
    },
  } as const,
  NullSchema,
  async ({ from, to }) => {
    await move(from, to);
    return null;
  }
);

export const Stat = createZAction(
  StringSchema,
  {
    type: "object",
    additionalProperties: false,
    properties: {
      path: StringSchema,
      isDirectory: BooleanSchema,
    },
    required: ["path", "isDirectory"],
  } as const,
  async (path) => {
    const stats = await stat(path);
    return { path, isDirectory: stats.isDirectory() };
  }
);

export const Exists = createZAction(
  StringSchema,
  BooleanSchema,
  async (path: string) => {
    return await pathExists(path);
  }
);

export const DeleteFile = createZAction(
  StringSchema,
  NullSchema,
  async (path) => {
    await unlink(path);
    return null;
  }
);
