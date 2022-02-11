import { join } from "path";

import { JSONBlock, createJSONBlock } from "agent-crypto";
import { readJSONFile, writeJSONFile } from "agent-node";
import { mkdirp, readFile, readdir, rename, stat, writeFile } from "fs-extra";

import { Actions } from "./actions";
import { BlockRef, TreeState } from "./CoreActions";
import { NotFoundError, RequestError } from "./HTTP";
import { ServerContext } from "./ServerContext";

export type ServerActions = {
  CreateBlock: { value: any };
  SetDoc: { name: string; value: any };
  DeleteDoc: { name: string };
  DeleteBlock: { id: string };
  AppendChain: { name: string; value: any; message?: string };
  GetBlockJSON: { id: string };
};

export type Commit<V> = {
  type: "Commit";
  on: string | null;
  value: V;
  message?: string;
  time: number;
};

export type Chain = {
  type: "Chain";
  head: BlockRef;
  // eval: 'FileTree' |

  // todo, add eval settings such as cache pruning behavior
};

export function createCoreData(
  { blocksDir, docsDir, trashDir, blockCacheDir, stateCacheDir }: ServerContext,
  onNextDispatch: (
    anonActionType: any, // crap, string??? wtf
    anonActionPayload: any // whopsie any!!
  ) => Promise<any> // whopsie any!!
) {
  async function cacheBlocks(blockCache: BlockCache) {
    const remainder = blockCache.entries();
    let allSaveOps = Promise.resolve();
    let nextEntry = remainder.next();
    while (!nextEntry.done) {
      const [id, blockValue] = nextEntry.value;
      const blockPath = join(blockCacheDir, id);
      allSaveOps.then(() => writeFile(blockPath, blockValue.jsonValue));
      nextEntry = remainder.next();
    }
    await allSaveOps;
  }

  async function createBlock(
    payload: ServerActions["CreateBlock"]
  ): Promise<BlockRef> {
    const block = await createJSONBlock(payload.value);
    const blockFile = join(blocksDir, block.id);
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
      type: "BlockRef",
      id: block.id,
    };
  }

  async function getBlockJSON(payload: ServerActions["GetBlockJSON"]) {
    const blockFile = join(blocksDir, payload.id);
    const blockData = await readFile(blockFile, { encoding: "utf8" });
    const blockJSON = JSON.parse(blockData);
    return blockJSON;
  }

  async function setDoc(payload: ServerActions["SetDoc"]) {
    const docFile = join(docsDir, payload.name);
    await writeFile(docFile, JSON.stringify(payload.value));
    return {};
  }

  async function deleteDoc(payload: ServerActions["DeleteDoc"]) {
    const docFile = join(docsDir, payload.name);
    const trashedFile = join(trashDir, `doc-${payload.name}`);
    await rename(docFile, trashedFile);
  }

  async function deleteBlock(payload: ServerActions["DeleteBlock"]) {
    const blockFile = join(blocksDir, payload.id);
    const trashedFile = join(trashDir, `block-${payload.id}`);
    await rename(blockFile, trashedFile);
  }

  async function listBlocks() {
    const blockList = (await readdir(blocksDir)).filter((fileName) => {
      if (fileName[0] === ".") return false;
      return true;
    });
    return { children: blockList };
  }

  async function listDocs() {
    const docList = await readdir(docsDir);
    return { children: docList };
  }

  async function appendChain({
    name,
    value,
    message,
  }: ServerActions["AppendChain"]) {
    let on: string | null = null;
    const time = Date.now();
    const prevDoc = await getDoc(name);
    if (prevDoc.value !== undefined) {
      if (prevDoc.value.type === "BlockRef" && prevDoc.value.id) {
        on = (prevDoc.value as BlockRef).id;
      } else
        throw new Error(
          `AppendChain only works when the doc is BlockRef type (to a Commit type block). Instead the "${name}" doc is of type "${prevDoc.value?.type}"`
        );
    }
    const commitValue: Commit<typeof value> = {
      type: "Commit",
      value,
      on,
      message,
      time,
    };
    const commitBlock = await createBlock({
      value: commitValue,
    });
    await setDoc({
      name,
      value: {
        type: "BlockRef",
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

  function Unchain(prevState: any, action: any) {
    return [...(prevState || []), action];
  }

  async function dispatch<ActionType extends keyof ServerActions>(
    actionType: ActionType,
    actionPayload: ServerActions[ActionType]
  ) {
    switch (actionType) {
      case "CoreData/CreateBlock":
        return await createBlock(actionPayload as any);
      case "CoreData/SetDoc":
        return await setDoc(actionPayload as any);
      case "CoreData/DeleteDoc":
        return await deleteDoc(actionPayload as any);
      case "CoreData/DeleteBlock":
        return await deleteBlock(actionPayload as any);
      case "CoreData/AppendChain":
        return await appendChain(actionPayload as any);
      case "GetBlockJSON":
        return await getBlockJSON(actionPayload as any);
      default:
        return await onNextDispatch(actionType, actionPayload);
    }
  }

  async function rollupBlocksInCommitChain<V>(commitValue: Commit<V>) {
    if (commitValue.type !== "Commit") {
      throw new Error("Cannot roll up non-commit block");
    }
    let walkId: string | null = commitValue.on;
    const rollup: Array<Commit<any>> = [commitValue];
    while (walkId) {
      const walkBlockValue = await getBlockJSON({ id: walkId });
      rollup.push(walkBlockValue);
      if (walkBlockValue.type !== "Commit") {
        walkId = null;
      }
      walkId = walkBlockValue.on;
    }
    return rollup;
  }

  type DeepBlockState = any;

  type BlockCache = Map<string, JSONBlock>;

  async function extractBlocksToCache(
    deepState: DeepBlockState,
    blockCache: BlockCache
  ): Promise<any> {
    if (deepState === null) return null;
    if (Array.isArray(deepState))
      return Promise.all(
        deepState.map((d) => extractBlocksToCache(d, blockCache))
      );
    if (typeof deepState === "object") {
      if (deepState.type === "Block" && deepState.jsonValue !== undefined) {
        const block = await createJSONBlock(deepState.jsonValue);
        blockCache.set(block.id, block);
        return { type: "BlockRef", id: block.id };
      }
      return Object.fromEntries(
        await Promise.all(
          Object.entries(deepState).map(async ([k, v]) => [
            k,
            await extractBlocksToCache(v, blockCache),
          ])
        )
      );
    }
    return deepState;
  }

  async function evalCommitStep<V>(
    state: TreeState<any>,
    commit: any,
    blockCache: BlockCache
  ): Promise<TreeState<any>> {
    const matchedAction = Actions[commit.value.type as keyof typeof Actions];
    if (matchedAction) {
      const nextDeepState = matchedAction.handler(state, commit.value);
      const result = await extractBlocksToCache(nextDeepState, blockCache);
      return result;
    }
    return {
      value: null,
      children: {},
    };
  }

  async function evalCommitChain<V>(
    commitValue: Commit<V>,
    blockCache: BlockCache
  ) {
    const blocksInChain = await rollupBlocksInCommitChain(commitValue);
    let walkReduceValue: any = undefined;
    for (
      let blockIndex = blocksInChain.length - 1;
      blockIndex >= 0;
      blockIndex -= 1
    ) {
      const stepBlock = blocksInChain[blockIndex];
      const nextValue = await evalCommitStep(
        walkReduceValue,
        stepBlock,
        blockCache
      );
      walkReduceValue = nextValue;
    }
    return walkReduceValue;
  }

  function aggregateLinkedAccessibleBlocks(
    tree: TreeState<any>,
    blockCache: BlockCache,
    outputBlocks: BlockCache
  ) {
    const childrenRefs = Object.values(tree.children);
    childrenRefs.forEach((child) => {
      if (child.type === "BlockRef") {
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

    let evalValue = doc.value;
    let evalBlockId: string | null = null;

    while (evalValue.type === "DocRef") {
      // follow doc ref with getDoc(evalValue.something)
    }

    if (evalValue.type === "BlockRef") {
      evalBlockId = evalValue.id;
      evalValue = await getBlockJSON({ id: evalValue.id });
      // todo try this block json and fall back to BlockRef in case of binary file
    } else if (evalValue.type === "Blockchain") {
      evalBlockId = evalValue.head.id;
    }

    if (evalValue.type === "Commit") {
      const evalCachePath = join(stateCacheDir, `eval-${evalBlockId}`);
      const cachedResult = await readJSONFile(evalCachePath);
      if (cachedResult) {
        console.log("USING CACHED EVAL RESULT");
        evalValue = cachedResult;
      } else {
        console.log("PERFORMING EVAL");
        evalValue = await evalCommitChain(evalValue, evalBlockCache);
        const cachableBlocks: BlockCache = new Map();
        aggregateLinkedAccessibleBlocks(
          evalValue,
          evalBlockCache,
          cachableBlocks
        );
        await writeJSONFile(evalCachePath, evalValue);
        await cacheBlocks(cachableBlocks);
      }

      if (restTerms[0] === ".blocks") {
        const blockId = restTerms[1];
        const matchedBlock = evalBlockCache.get(blockId);
        if (restTerms.length > 2) {
          throw new RequestError("Must query for .blocks/BLOCK_ID");
        }
        if (matchedBlock) {
          return matchedBlock.value;
        }
        try {
          const cachedBlockData = await readJSONFile(
            join(blockCacheDir, blockId)
          );
          return cachedBlockData;
        } catch (e) {
          throw new NotFoundError();
        }
      }
    }

    if (restTerms.length) {
      return undefined;
    }

    return evalValue;
  }

  async function getDoc(name: string) {
    const docFile = join(docsDir, name);
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
    createBlock,
    setDoc,
    deleteDoc,
    getDoc,
    getBlockJSON,
    getEval,
    deleteBlock,
    appendChain,
    listBlocks,
    listDocs,
    dispatch,
  };
}
