import {
  createZGroup,
  createZGettable,
  createZContainer,
  createZAction,
  createZGettableGroup,
  JSONSchema,
  ZGettable,
  NotFoundError,
} from "@zerve/core";
import { createJSONBlock } from "@zerve/crypto";
import {
  mkdirp,
  rm,
  stat,
  writeFile,
  readdir,
  readFile,
  rename,
} from "fs-extra";
import { join } from "path";

export const ChildrenListSchema = {
  type: "object",
  required: ["children"],
  properties: {
    children: { type: "array", items: { type: "string" } },
  },
  additionalProperties: false,
} as const;

export async function ensureDir(dir: string) {
  await mkdirp(dir);
}

const DocValueSchema: JSONSchema = {
  type: "object",
  additionalProperties: false,
  required: ["type, id"],
  properties: {
    type: { const: "BlockLink" },
    id: { type: "string" },
  },
} as const;

export type CoreDataModule = Awaited<ReturnType<typeof createCoreData>>;

export const AnySchema = {} as const;

function prefixedWithDot(fileName: string): boolean {
  if (fileName[0] === ".") return false;
  return true;
}

export async function createCoreData(dataDir: string) {
  const _blocksDir = `${dataDir}/blocks`;
  const _docsDir = `${dataDir}/docs`;
  const _trashDir = `${dataDir}/trash`;
  await ensureDir(_blocksDir);
  await ensureDir(_docsDir);
  await ensureDir(_trashDir);

  const Docs = createZGettableGroup<
    typeof ChildrenListSchema,
    ZGettable<typeof DocValueSchema, void>,
    void
  >(
    ChildrenListSchema,
    async (name: string) => {
      return createZGettable(DocValueSchema, async () => {
        const doc = await _getDocValue(name);
        return doc;
      });
    },
    async () => {
      return await _listDocs();
    }
  );

  const Blocks = createZGettableGroup<
    typeof ChildrenListSchema,
    ZGettable<typeof DocValueSchema, void>,
    void
  >(
    ChildrenListSchema,
    async (id: string) => {
      return createZGettable({}, async () => {
        const blockValue = await GetBlockJSON.call({ id });
        return blockValue;
      });
    },
    async () => {
      return await _listBlocks();
    }
  );

  const CreateBlock = createZAction(
    {
      type: "object",
      properties: {
        value: {},
      },
      required: ["value"],
      additionalProperties: false,
    } as const,
    {
      type: "object",
      properties: {
        type: { const: "BlockLink" },
        id: { type: "string" },
      },
      required: ["type", "id"],
      additionalProperties: false,
    } as const,
    async (payload) => {
      const block = await createJSONBlock(payload.value);
      const blockFile = join(_blocksDir, block.id);
      try {
        // attempt to "stat" the file, or query for the low-level fs info, the most low-impact way to see if a file exists (error if it does not exist)
        const blockFilePrev = await stat(blockFile);

        // this check is nice but may be excessive because it creates a buffer to determine the byte length of this value:
        // if (blockFilePrev.size !== Buffer.from(block.jsonValue).byteLength)
        //   throw new Error("Persisted block does not match!");
      } catch (e) {
        // e.code === ENOENT is inferred here, but it could also be the "Persisted block does not match" error
        await writeFile(blockFile, block.jsonValue);
      }
      return {
        type: "BlockLink",
        id: block.id,
      } as const;
    }
  );

  const GetBlockJSON = createZAction(
    {
      type: "object",
      properties: {
        id: { type: "string", minLength: 66, maxLength: 66 },
      },
      required: ["id"],
      additionalProperties: false,
    } as const,
    {} as const,
    async ({ id }) => {
      const blockFile = join(_blocksDir, id);
      try {
        const blockData = await readFile(blockFile, { encoding: "utf8" });
        const blockJSON = JSON.parse(blockData);
        return blockJSON;
      } catch (e: any) {
        if (e.code === "ENOENT")
          throw new NotFoundError("NotFound", `Block not found`, { id });
        throw e;
      }
    }
  );

  const SetDoc = createZAction(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        value: {},
      },
      required: ["name", "value"],
      additionalProperties: false,
    } as const,
    { type: "object", additionalProperties: false } as const,
    async ({ name, value }) => {
      const docFile = join(_docsDir, name);
      await writeFile(docFile, JSON.stringify(value));
      return {};
    }
  );

  const DeleteDoc = createZAction(
    {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
      },
      required: ["name"],
      additionalProperties: false,
    } as const,
    { type: "object", additionalProperties: false } as const,
    async ({ name }) => {
      const docFile = join(_docsDir, name);
      const trashedFile = join(_trashDir, `doc-${name}`);
      await rename(docFile, trashedFile);
      return {};
    }
  );

  const DeleteBlock = createZAction(
    {
      type: "object",
      properties: {
        id: { type: "string", minLength: 66, maxLength: 66 },
      },
      required: ["id"],
      additionalProperties: false,
    } as const,
    { type: "object", additionalProperties: false } as const,
    async ({ id }) => {
      const blockFile = join(_blocksDir, id);
      const trashedFile = join(_trashDir, `block-${id}`);
      await rename(blockFile, trashedFile);
      return {};
    }
  );

  async function _listBlocks() {
    const blockList = (await readdir(_blocksDir)).filter(prefixedWithDot);
    return { children: blockList };
  }

  async function _listDocs(): Promise<FromSchema<typeof ChildrenList>> {
    const docList = (await readdir(_docsDir)).filter(prefixedWithDot);
    return { children: docList };
  }

  async function _getDocValue(name: string) {
    const docFile = join(_docsDir, name);
    try {
      const fileValue = await readFile(docFile);
      const value = JSON.parse(fileValue.toString("utf-8"));
      return value;
    } catch (e: any) {
      if (e.code === "ENOENT") {
        return undefined;
      }
      throw e;
    }
  }

  return createZContainer({
    Docs,
    Blocks,
    Actions: createZContainer({
      CreateBlock,
      DeleteDoc,
      DeleteBlock,
      SetDoc,
      GetBlockJSON,
    } as const),
  } as const);
}
