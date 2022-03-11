import {
  createZGroup,
  createZGettable,
  createZContainer,
  createZAction,
  createZListableGroup,
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

async function prepareDataDirs(dataDir?: string) {
  const homeDir = process.env.HOME;
  const defaultZDataDir = `${homeDir}/.zerve`;

  const zDataDir = dataDir || defaultZDataDir;
  await mkdirp(zDataDir);

  const blocksDir = `${zDataDir}/blocks`;
  await mkdirp(blocksDir);

  const docsDir = `${zDataDir}/docs`;
  await mkdirp(docsDir);

  const trashDir = `${zDataDir}/trash`;
  await mkdirp(trashDir);

  const cacheDir = `${zDataDir}/cache`;
  const stateCacheDir = `${zDataDir}/cache/state`;
  const blockCacheDir = `${zDataDir}/cache/blocks`;

  const shouldResetCache = true; // todo, lol obviously
  if (shouldResetCache) {
    try {
      await rm(cacheDir, { recursive: true });
    } catch (e: any) {
      if (e.code !== "ENOENT") throw e;
    }
    await mkdirp(cacheDir);
    await mkdirp(stateCacheDir);
    await mkdirp(blockCacheDir);
  }

  return {
    blocksDir,
    docsDir,
    trashDir,
    cacheDir,
    stateCacheDir,
    blockCacheDir,
  };
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

async function createCoreData(dataDir?: string) {
  const dataDirs = await prepareDataDirs(dataDir);

  const docs = createZListableGroup<ZGettable<typeof DocValueSchema, void>>(
    async (name: string) => {
      return createZGettable(DocValueSchema, async () => {
        const doc = await getDoc(name);
        return doc;
      });
    },
    async () => {
      return await listDocs();
    }
  );

  const blocks = createZListableGroup<ZGettable<typeof DocValueSchema, void>>(
    async (id: string) => {
      return createZGettable({}, async () => {
        const blockValue = await getBlockJSON.call({ id });
        return blockValue;
      });
    },
    async () => {
      return await listBlocks();
    }
  );

  const createBlock = createZAction(
    {
      type: "object",
      properties: {
        value: {},
      },
      required: ["value"],
      additionalProperties: false,
    } as const,
    async (payload) => {
      const block = await createJSONBlock(payload.value);
      const blockFile = join(dataDirs.blocksDir, block.id);
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
      };
    }
  );

  const getBlockJSON = createZAction(
    {
      type: "object",
      properties: {
        id: { type: "string", minLength: 66, maxLength: 66 },
      },
      required: ["id"],
      additionalProperties: false,
    } as const,
    async ({ id }) => {
      const blockFile = join(dataDirs.blocksDir, id);
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

  const setDoc = createZAction(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        value: {},
      },
      required: ["name", "value"],
      additionalProperties: false,
    } as const,
    async ({ name, value }) => {
      const docFile = join(dataDirs.docsDir, name);
      await writeFile(docFile, JSON.stringify(value));
      return {};
    }
  );

  const deleteDoc = createZAction(
    {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
      },
      required: ["name"],
      additionalProperties: false,
    } as const,
    async ({ name }) => {
      const docFile = join(dataDirs.docsDir, name);
      const trashedFile = join(dataDirs.trashDir, `doc-${name}`);
      await rename(docFile, trashedFile);
    }
  );

  const deleteBlock = createZAction(
    {
      type: "object",
      properties: {
        id: { type: "string", minLength: 66, maxLength: 66 },
      },
      required: ["id"],
      additionalProperties: false,
    } as const,
    async ({ id }) => {
      const blockFile = join(dataDirs.blocksDir, id);
      const trashedFile = join(dataDirs.trashDir, `block-${id}`);
      await rename(blockFile, trashedFile);
    }
  );

  async function listBlocks() {
    const blockList = (await readdir(dataDirs.blocksDir)).filter((fileName) => {
      if (fileName[0] === ".") return false;
      return true;
    });
    return { children: blockList };
  }

  async function listDocs() {
    const docList = await readdir(dataDirs.docsDir);
    return { children: docList };
  }

  async function getDoc(name: string) {
    const docFile = join(dataDirs.docsDir, name);
    try {
      const fileValue = await readFile(docFile);
      const value = JSON.parse(fileValue.toString("utf-8"));
      return { value, name };
    } catch (e: any) {
      if (e.code === "ENOENT") {
        return { value: undefined, name };
      }
      throw e;
    }
  }

  return {
    docs,
    blocks,
    actions: createZContainer({
      createBlock,
      deleteDoc,
      deleteBlock,
      setDoc,
      getBlockJSON,
    }),
  } as const;
}

const CoreData = {
  createCoreData,
};
export default CoreData;
