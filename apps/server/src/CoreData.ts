import { join } from "path";

import {
  ActionDefinition,
  ActionSet,
  createActionSet,
  defineAction,
} from "@zerve/core";
import { JSONBlock, createJSONBlock } from "@zerve/crypto";
import { readJSONFile, writeJSONFile } from "@zerve/node";
import { mkdirp, readFile, readdir, rename, stat, writeFile } from "fs-extra";

import { Actions } from "./ChainActions";
import { BlockLink, TreeState } from "./CoreActions";
import { NotFoundError, RequestError } from "./HTTP";
import { ServerContext } from "./ServerContext";

export type Commit<V> = {
  type: "Commit";
  on: string | null;
  value: V;
  message?: string;
  time: number;
};

export type Chain = {
  type: "Chain";
  head: BlockLink;
  // eval: 'FileTree' |

  // todo, add eval settings such as cache pruning behavior
};

type DeepBlockState = any;

type BlockCache = Map<string, JSONBlock>;

export function createCoreData(serverContext: ServerContext) {
  async function _cacheBlocks(blockCache: BlockCache) {
    const remainder = blockCache.entries();
    let allSaveOps = Promise.resolve();
    let nextEntry = remainder.next();
    while (!nextEntry.done) {
      const [id, blockValue] = nextEntry.value;
      const blockPath = join(serverContext.blockCacheDir, id);
      allSaveOps.then(() => writeFile(blockPath, blockValue.jsonValue));
      nextEntry = remainder.next();
    }
    await allSaveOps;
  }

  const CreateBlock = defineAction(
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
      const blockFile = join(serverContext.blocksDir, block.id);
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

  const GetBlockJSON = defineAction(
    {
      type: "object",
      properties: {
        id: { type: "string", minLength: 66, maxLength: 66 },
      },
      required: ["id"],
      additionalProperties: false,
    } as const,
    async ({ id }) => {
      const blockFile = join(serverContext.blocksDir, id);
      const blockData = await readFile(blockFile, { encoding: "utf8" });
      const blockJSON = JSON.parse(blockData);
      return blockJSON;
    }
  );

  const SetDoc = defineAction(
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
      const docFile = join(serverContext.docsDir, name);
      await writeFile(docFile, JSON.stringify(value));
      return {};
    }
  );

  const DeleteDoc = defineAction(
    {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
      },
      required: ["name"],
      additionalProperties: false,
    } as const,
    async ({ name }) => {
      const docFile = join(serverContext.docsDir, name);
      const trashedFile = join(serverContext.trashDir, `doc-${name}`);
      await rename(docFile, trashedFile);
    }
  );

  const DeleteBlock = defineAction(
    {
      type: "object",
      properties: {
        id: { type: "string", minLength: 66, maxLength: 66 },
      },
      required: ["id"],
      additionalProperties: false,
    } as const,
    async ({ id }) => {
      const blockFile = join(serverContext.blocksDir, id);
      const trashedFile = join(serverContext.trashDir, `block-${id}`);
      await rename(blockFile, trashedFile);
    }
  );

  async function listBlocks() {
    const blockList = (await readdir(serverContext.blocksDir)).filter(
      (fileName) => {
        if (fileName[0] === ".") return false;
        return true;
      }
    );
    return { children: blockList };
  }

  async function listDocs() {
    const docList = await readdir(serverContext.docsDir);
    return { children: docList };
  }

  const AppendChain = defineAction(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        value: {},
        message: { type: "string" },
      },
      required: ["name", "value"],
      additionalProperties: false,
    } as const,
    async ({ name, value, message }) => {
      let on: string | null = null;
      const time = Date.now();
      const prevDoc = await getDoc(name);
      if (prevDoc.value !== undefined) {
        if (prevDoc.value.type === "BlockLink" && prevDoc.value.id) {
          on = (prevDoc.value as BlockLink).id;
        } else
          throw new Error(
            `AppendChain only works when the doc is BlockLink type (to a Commit type block). Instead the "${name}" doc is of type "${prevDoc.value?.type}"`
          );
      }
      const commitValue: Commit<typeof value> = {
        type: "Commit",
        value,
        on,
        message,
        time,
      };
      const commitBlock = await CreateBlock.handle({
        value: commitValue,
      });
      await SetDoc.handle({
        name,
        value: {
          type: "BlockLink",
          id: commitBlock.id,
        },
      });
      return {
        on,
        time,
        commitId: commitBlock.id,
        name,
      };
    }
  );

  async function _rollupBlocksInCommitChain<V>(commitValue: Commit<V>) {
    if (commitValue.type !== "Commit") {
      throw new Error("Cannot roll up non-commit block");
    }
    let walkId: string | null = commitValue.on;
    const rollup: Array<Commit<any>> = [commitValue];
    while (walkId) {
      const walkBlockValue = await GetBlockJSON.handle({ id: walkId });
      rollup.push(walkBlockValue);
      if (walkBlockValue.type !== "Commit") {
        walkId = null;
      }
      walkId = walkBlockValue.on;
    }
    return rollup;
  }

  async function _extractBlocksToCache(
    deepState: DeepBlockState,
    blockCache: BlockCache
  ): Promise<any> {
    if (deepState === null) return null;
    if (Array.isArray(deepState))
      return Promise.all(
        deepState.map((d) => _extractBlocksToCache(d, blockCache))
      );
    if (typeof deepState === "object") {
      if (deepState.type === "Block" && deepState.jsonValue !== undefined) {
        const block = await createJSONBlock(deepState.jsonValue);
        blockCache.set(block.id, block);
        return { type: "BlockLink", id: block.id };
      }
      return Object.fromEntries(
        await Promise.all(
          Object.entries(deepState).map(async ([k, v]) => [
            k,
            await _extractBlocksToCache(v, blockCache),
          ])
        )
      );
    }
    return deepState;
  }

  async function _evalCommitStep<V>(
    state: TreeState<any>,
    commit: any,
    blockCache: BlockCache
  ): Promise<TreeState<any>> {
    const matchedAction = Actions[commit.value.type as keyof typeof Actions];
    if (matchedAction) {
      const nextDeepState = matchedAction.handler(state, commit.value);
      const result = await _extractBlocksToCache(nextDeepState, blockCache);
      return result;
    }
    return {
      value: null,
      children: {},
    };
  }

  async function _evalCommitChain<V>(
    commitValue: Commit<V>,
    blockCache: BlockCache
  ) {
    const blocksInChain = await _rollupBlocksInCommitChain(commitValue);
    let walkReduceValue: any = undefined;
    for (
      let blockIndex = blocksInChain.length - 1;
      blockIndex >= 0;
      blockIndex -= 1
    ) {
      const stepBlock = blocksInChain[blockIndex];
      const nextValue = await _evalCommitStep(
        walkReduceValue,
        stepBlock,
        blockCache
      );
      walkReduceValue = nextValue;
    }
    return walkReduceValue;
  }

  function _aggregateLinkedAccessibleBlocks(
    tree: TreeState<any>,
    blockCache: BlockCache,
    outputBlocks: BlockCache
  ) {
    const childrenRefs = Object.values(tree.children);
    childrenRefs.forEach((child) => {
      if (child.type === "BlockLink") {
        const cached = blockCache.get(child.id);
        if (cached) outputBlocks.set(child.id, cached);
      }
    });
  }

  async function getEval(evalPath: string) {
    const evalPathTerms = evalPath.split("/");
    const [thisPathTerm, ...restTerms] = evalPathTerms;
    const evalBlockCache: BlockCache = new Map();

    const doc = await getDoc(thisPathTerm);

    async function getEvalBlock(blockId: string) {
      const matchedBlock = evalBlockCache.get(blockId);
      if (restTerms.length > 2) {
        throw new RequestError("Must query for .blocks/BLOCK_ID");
      }
      if (matchedBlock) {
        return matchedBlock.value;
      }
      try {
        const cachedBlockData = await readJSONFile(
          join(serverContext.blockCacheDir, blockId)
        );
        return cachedBlockData;
      } catch (e) {
        throw new NotFoundError();
      }
    }

    let evalValue = doc.value;
    let evalBlockId: string | null = null;

    while (evalValue.type === "DocLink") {
      // follow doc ref with getDoc(evalValue.something)
    }

    if (evalValue.type === "BlockLink") {
      evalBlockId = evalValue.id;
      evalValue = await GetBlockJSON.handle({ id: evalValue.id });
      // todo try this block json and fall back to BlockLink in case of binary file
    } else if (evalValue.type === "Blockchain") {
      evalBlockId = evalValue.head.id;
    }

    if (evalValue.type === "Commit") {
      const evalCachePath = join(
        serverContext.stateCacheDir,
        `eval-${evalBlockId}`
      );
      const cachedResult = await readJSONFile(evalCachePath);
      if (cachedResult) {
        evalValue = cachedResult;
      } else {
        evalValue = await _evalCommitChain(evalValue, evalBlockCache);
        const cachableBlocks: BlockCache = new Map();
        _aggregateLinkedAccessibleBlocks(
          evalValue,
          evalBlockCache,
          cachableBlocks
        );
        await writeJSONFile(evalCachePath, evalValue);
        await _cacheBlocks(cachableBlocks);
      }

      if (restTerms[0] === ".blocks") {
        const blockId = restTerms[1];
        return await getEvalBlock(blockId);
      }
    }

    let resultingValue = evalValue;

    for (let termIndex = 0; termIndex < restTerms.length; termIndex += 1) {
      const pathTerm = restTerms[termIndex];
      const child = resultingValue?.children?.[pathTerm];
      if (child?.type !== "BlockLink") {
        throw new Error(`Cannot query for "${pathTerm}" in result`);
      }
      const childId = child?.id;
      if (!childId) {
        throw new Error(
          `Cannot get child query id... what a confusing error description!`
        );
      }
      const childBlock = await getEvalBlock(childId);
      resultingValue = childBlock;
    }

    return resultingValue;
  }

  async function getDoc(name: string) {
    const docFile = join(serverContext.docsDir, name);
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
  const actions = {
    DeleteDoc,
    SetDoc,
    GetBlockJSON,
    CreateBlock,
    DeleteBlock,
    AppendChain,
  };

  return {
    getDoc,
    getEval,
    listBlocks,
    listDocs,
    actions,
  };
}
