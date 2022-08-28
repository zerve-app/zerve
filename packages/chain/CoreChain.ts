import {
  createZGettable,
  createZContainer,
  createZAction,
  JSONSchema,
  NotFoundError,
  DeepBlockState,
  BlockLink,
  BlockCache,
  TreeState,
  Commit,
  FromSchema,
  ajv,
  RequestError,
  ZGroup,
} from "@zerve/zed";
import { createJSONBlock } from "@zerve/crypto";
import { CoreDataModule } from "@zerve/data";
import { joinPath, MakeDir, ReadJSON, WriteJSON } from "@zerve/system-files";

export type ZChainStateCalculator<
  StateSchema extends JSONSchema,
  Actions extends Record<
    string,
    ZActionDefinition<FromSchema<StateSchema>, any>
  >,
> = {
  stateSchema: StateSchema;
  initialState: FromSchema<StateSchema>;
  actions: Actions;
  validateAction: <ActionName extends keyof Actions>(
    action: any,
  ) => FromSchema<Actions[ActionName]["schema"]>;
};

export function createZChainStateCalculator<
  StateSchema extends JSONSchema,
  Actions extends Record<
    string,
    ZActionDefinition<FromSchema<StateSchema>, any>
  >,
>(
  stateSchema: StateSchema,
  initialState: FromSchema<StateSchema>,
  actions: Actions,
  finalStateMapper: (value: FromSchema<StateSchema>) => FromSchema<StateSchema>,
): ZChainStateCalculator<StateSchema, Actions> {
  const validators = Object.fromEntries(
    Object.entries(actions).map(([actionName, actionDef]) => {
      return [actionName, ajv.compile(actionDef.schema)];
    }),
  );
  return {
    stateSchema,
    initialState,
    actions,
    validateAction: <ActionName extends keyof Actions>(
      action: any,
    ): FromSchema<Actions[ActionName]["schema"]> => {
      const validator = validators[action.name];
      if (!validator)
        throw new RequestError(
          "ValidationError",
          `cannot validate unknown action "${action.name}"`,
          { name: action.name, actions: Object.keys(validators) },
        );
      const valid = validator(action.value);
      if (!valid) {
        throw new RequestError(`ValidationError`, "validation fails", {});
      }
      return action;
    },
  } as const;
}

export type ZActionDefinition<
  StateSchema extends JSONSchema,
  PayloadSchema extends JSONSchema,
> = {
  schema: PayloadSchema;
  handler: (
    state: FromSchema<StateSchema>,
    payload: FromSchema<PayloadSchema>,
  ) => FromSchema<StateSchema>;
};

export async function createZChainState<
  StateSchema extends JSONSchema,
  Actions extends Record<
    string,
    ZActionDefinition<FromSchema<StateSchema>, any>
  >,
>(
  data: CoreDataModule,
  cacheFilesPath: string,
  docName: string,
  calculator: ZChainStateCalculator<StateSchema, Actions>,
  finalStateMapper?: (
    state: FromSchema<StateSchema>,
  ) => FromSchema<StateSchema>,
) {
  await MakeDir.call(joinPath(cacheFilesPath, "state"));
  await MakeDir.call(joinPath(cacheFilesPath, "blocks"));

  async function _getCachedResult(blockId: string) {
    return await ReadJSON.call(
      joinPath(cacheFilesPath, "state", `eval-${blockId}`),
    );
  }

  async function _rollupBlocksInCommitChain<V>(commitValue: Commit<V>) {
    if (commitValue.type !== "Commit") {
      throw new Error("Cannot roll up non-commit block");
    }
    let walkId: string | null = commitValue.on;
    const blocksInChain: Array<Commit<any>> = [commitValue];
    let walkEndCacheResultValue = undefined;
    while (walkId) {
      const cachedResult = await _getCachedResult(walkId);
      if (cachedResult) {
        walkEndCacheResultValue = cachedResult;
        walkId = null;
      } else {
        const walkBlockValue = await data.z.Actions.z.GetBlockJSON.call({
          id: walkId,
        });

        blocksInChain.push(walkBlockValue);
        if (walkBlockValue.type !== "Commit") {
          walkId = null;
        }
        walkId = walkBlockValue.on;
      }
    }
    return { blocksInChain, walkEndCacheResultValue };
  }

  async function _extractBlocksToCache(
    deepState: DeepBlockState,
    blockCache: BlockCache,
  ): Promise<any> {
    if (deepState === null) return null;
    if (Array.isArray(deepState))
      return Promise.all(
        deepState.map((d) => _extractBlocksToCache(d, blockCache)),
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
          ]),
        ),
      );
    }
    return deepState;
  }

  async function _evalCommitStep(
    state: FromSchema<StateSchema>,
    commit: any,
    blockCache: BlockCache,
  ): Promise<FromSchema<StateSchema>> {
    const matchedAction =
      calculator.actions[commit.value.name as keyof typeof calculator.actions];
    if (matchedAction) {
      try {
        const nextDeepState = matchedAction.handler(state, commit.value.value);
        const result = await _extractBlocksToCache(nextDeepState, blockCache);
        return result;
      } catch (e) {
        console.error("Unhandled State Update Error", e);
        return state;
      }
    }
    return calculator.initialState;
  }

  async function _evalCommitChain<V>(
    commitValue: Commit<V>,
    blockCache: BlockCache,
  ) {
    const { blocksInChain, walkEndCacheResultValue } =
      await _rollupBlocksInCommitChain(commitValue);
    let walkReduceValue: any =
      walkEndCacheResultValue === undefined
        ? calculator.initialState
        : walkEndCacheResultValue;
    for (
      let blockIndex = blocksInChain.length - 1;
      blockIndex >= 0;
      blockIndex -= 1
    ) {
      const stepBlock = blocksInChain[blockIndex];
      const nextValue = await _evalCommitStep(
        walkReduceValue,
        stepBlock,
        blockCache,
      );
      walkReduceValue = nextValue;
    }
    return walkReduceValue;
  }

  function _aggregateLinkedAccessibleBlocks(
    tree: TreeState<any>,
    blockCache: BlockCache,
    outputBlocks: BlockCache,
  ) {
    // // todo, add back this sort of functionality.
    // // this function was responsible for looking at the latest evaluated state and identifying all of the deeply-refereneced blocks, then copying them to a new cache so that the old cache can be garbage collected. (old computed blocks do not need to be retained)
    // const children = Object.values(tree.children);
    // children.forEach((child) => {
    //   if (child.type === "BlockLink") {
    //     const cached = blockCache.get(child.id);
    //     if (cached) outputBlocks.set(child.id, cached);
    //   }
    // });
  }

  async function _getEval() {
    const evalBlockCache: BlockCache = new Map();

    const doc = await data.z.Docs.getChild(docName);

    if (!doc) return calculator.initialState;

    async function getEvalBlock(blockId: string) {
      const matchedBlock = evalBlockCache.get(blockId);
      // if (restTerms.length > 2) {
      //   throw new RequestError("PathError", "Must query for .blocks/BLOCK_ID", {
      //     terms: restTerms,
      //   });
      // }
      if (matchedBlock) {
        return matchedBlock.value;
      }
      try {
        const cachedBlockData = await ReadJSON.call(
          joinPath(cacheFilesPath, "blocks", blockId),
        );
        return cachedBlockData;
      } catch (e) {
        throw new NotFoundError("EvalNotFound", "Not Found.", {
          // path: evalPath,
        });
      }
    }

    const docCurrentValue = await doc.get();

    if (docCurrentValue == null) {
      return calculator.initialState;
    }

    let evalValue = docCurrentValue;
    let evalBlockId: string | null = null;

    while (evalValue.type === "DocLink") {
      // follow doc ref with getDoc(evalValue.something)
    }

    if (evalValue.type === "BlockLink") {
      evalBlockId = evalValue.id;
      evalValue = await data.z.Actions.z.GetBlockJSON.call({
        id: evalValue.id,
      });
      // todo try this block json and fall back to BlockLink in case of binary file
    } else if (evalValue.type === "Blockchain") {
      evalBlockId = evalValue.head.id;
    }
    if (evalValue.type === "Commit") {
      const cachedResult = await _getCachedResult(evalBlockId);
      if (cachedResult) {
        evalValue = cachedResult;
      } else {
        evalValue = await _evalCommitChain(evalValue, evalBlockCache);
        const cachableBlocks: BlockCache = new Map();
        _aggregateLinkedAccessibleBlocks(
          evalValue,
          evalBlockCache,
          cachableBlocks,
        );
        await WriteJSON.call({
          path: joinPath(cacheFilesPath, "state", `eval-${evalBlockId}`),
          value: evalValue,
        });
        // await _cacheBlocks(cachableBlocks);
      }

      // if (restTerms[0] === ".blocks") {
      //   const blockId = restTerms[1];
      //   return await getEvalBlock(blockId);
      // }
    }
    return evalValue;
    /// /// I think the following code was used to deeply query the resulting blocks of an eval
    //   let resultingValue = evalValue;

    //   for (let termIndex = 0; termIndex < restTerms.length; termIndex += 1) {
    //     const pathTerm = restTerms[termIndex];
    //     const child = resultingValue?.children?.[pathTerm];
    //     if (child?.type !== "BlockLink") {
    //       throw new Error(`Cannot query for "${pathTerm}" in result`);
    //     }
    //     const childId = child?.id;
    //     if (!childId) {
    //       throw new Error(
    //         `Cannot get child query id... what a confusing error description!`
    //       );
    //     }
    //     const childBlock = await getEvalBlock(childId);
    //     resultingValue = childBlock;
    //   }

    //   return resultingValue;
  }

  // const availableActionKeys = Object.keys(calculator.actions);

  const allActionsSchema = {
    oneOf: Object.entries(calculator.actions).map(([actionKey, actionDef]) => {
      return {
        type: "object",
        title: `${actionKey} Action`,
        additionalProperties: false,
        properties: {
          name: { const: actionKey },
          value: actionDef.schema,
        },
        required: ["name", "value"],
      };
    }),
  };

  const Dispatch = createZAction(
    allActionsSchema,
    {
      type: "object",
      properties: {
        on: { type: ["null", "string"] },
        time: { type: "number" },
        commitId: { type: "string" },
        name: { type: "string" },
      },
      required: ["on", "time", "commitId", "name"],
      additionalProperties: false,
    } as const,
    async (action) => {
      let on: string | null = null;
      const time = Date.now();
      const prevDoc = await data.z.Docs.getChild(docName);
      calculator.validateAction(action);
      const prevDocValue = await prevDoc?.get();
      if (prevDocValue !== undefined) {
        if (prevDocValue.type === "BlockLink" && prevDocValue.id) {
          on = (prevDocValue as BlockLink).id;
        } else
          throw new Error(
            `Dispatch only works when the doc is BlockLink type (to a Commit type block). Instead the "${docName}" doc is of type "${prevDocValue?.type}"`,
          );
      }
      const commitValue: Commit<any> = {
        type: "Commit",
        value: action,
        on,
        message: "...",
        time,
      };
      const commitBlock = await data.z.Actions.z.CreateBlock.call({
        value: commitValue,
      });
      await data.z.Actions.z.SetDoc.call({
        name: docName,
        value: {
          type: "BlockLink",
          id: commitBlock.id,
        },
      });
      return {
        on,
        time,
        commitId: commitBlock.id,
        name: docName,
      };
    },
  );

  const State = createZGettable<StateSchema, void>(
    calculator.stateSchema,
    async () => {
      let evalResult = await _getEval();

      if (finalStateMapper) {
        return finalStateMapper(evalResult);
      }
      return evalResult;
    },
  );

  return createZContainer({
    Dispatch,
    State,
  });
}

const CoreChain = {
  createZChainState,
  createZChainStateCalculator,
};

export default CoreChain;
