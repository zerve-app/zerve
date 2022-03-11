import {
  createZGroup,
  createZGettable,
  createZContainer,
  createZAction,
  createZListableGroup,
  JSONSchema,
  ZGettable,
  NotFoundError,
  DeepBlockState,
  BlockLink,
  BlockCache,
  RequestError,
  TreeState,
  Commit,
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
import { CoreDataModule } from "../CoreData/CoreData";

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
  const children = Object.values(tree.children);
  children.forEach((child) => {
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
      throw new RequestError("PathError", "Must query for .blocks/BLOCK_ID", {
        terms: restTerms,
      });
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
      throw new NotFoundError("EvalNotFound", "Not Found.", {
        path: evalPath,
      });
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

function createCoreChain(data: CoreDataModule) {
  const appendChain = createZAction(
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
      const prevDoc = await data.docs.getChild(name);
      const prevDocValue = await prevDoc.get();
      if (prevDocValue !== undefined) {
        if (prevDocValue.type === "BlockLink" && prevDocValue.id) {
          on = (prevDocValue as BlockLink).id;
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

  return createZContainer({
    append,
  });
}

const CoreChain = {
  createCoreChain,
};
export default CoreChain;
