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
} from "@zerve/core";
import { createJSONBlock } from "@zerve/crypto";
import { CoreDataModule } from "../CoreData/CoreData";
import { SystemFilesModule } from "../SystemFiles/SystemFiles";

export type ZChainStateCalculator<
  State,
  Actions extends Record<string, ZActionDefinition<State, any>>
> = {
  initialState: State;
  actions: Actions;
  validateAction: <ActionName extends keyof Actions>(
    action: any
  ) => FromSchema<Actions[ActionName]["schema"]>;
};

export function createZChainStateCalculator<
  State,
  Actions extends Record<string, ZActionDefinition<State, any>>
>(
  initialState: State,
  actions: Actions
): ZChainStateCalculator<State, Actions> {
  const validators = Object.fromEntries(
    Object.entries(actions).map(([actionName, actionDef]) => {
      return [actionName, ajv.compile(actionDef.schema)];
    })
  );
  return {
    initialState,
    actions,
    validateAction: <ActionName extends keyof Actions>(
      action: any
    ): FromSchema<Actions[ActionName]["schema"]> => {
      const validator = validators[action.name];
      if (!validator)
        throw new RequestError(
          "ValidationError",
          `cannot validate unknown action "${action.name}"`,
          { name: action.name }
        );
      const valid = validator(action.value);
      if (!valid) {
        console.log("INVALD", { valid, e: validator.errors });
        throw new Error("lol");
      }
      return action;
    },
  } as const;
}

export type ZActionDefinition<State, PayloadSchema extends JSONSchema> = {
  schema: PayloadSchema;
  handler: (state: State, payload: FromSchema<PayloadSchema>) => State;
};

export async function createZChainState<
  State,
  Actions extends Record<string, ZActionDefinition<State, any>>
>(
  data: CoreDataModule,
  cacheFiles: SystemFilesModule,
  docName: string,
  calculator: ZChainStateCalculator<State, Actions>
) {
  await cacheFiles.z.MakeDir.call({ path: "state" });
  await cacheFiles.z.MakeDir.call({ path: "blocks" });

  async function _rollupBlocksInCommitChain<V>(commitValue: Commit<V>) {
    if (commitValue.type !== "Commit") {
      throw new Error("Cannot roll up non-commit block");
    }
    let walkId: string | null = commitValue.on;
    const rollup: Array<Commit<any>> = [commitValue];
    while (walkId) {
      const walkBlockValue = await data.Actions.z.GetBlockJSON.call({
        id: walkId,
      });
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

  async function _evalCommitStep(
    state: State,
    commit: any,
    blockCache: BlockCache
  ): Promise<State> {
    const matchedAction =
      calculator.actions[commit.value.type as keyof typeof calculator.actions];
    if (matchedAction) {
      const nextDeepState = matchedAction.handler(state, commit.value);
      const result = await _extractBlocksToCache(nextDeepState, blockCache);
      return result;
    }
    return calculator.initialState;
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

  async function _getEval() {
    const evalBlockCache: BlockCache = new Map();

    const doc = await data.Docs.getChild(docName);

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
        const cachedBlockData = await cacheFiles.z.ReadJSON.call({
          path: `blocks/${blockId}`,
        });
        return cachedBlockData;
      } catch (e) {
        throw new NotFoundError("EvalNotFound", "Not Found.", {
          // path: evalPath,
        });
      }
    }

    let evalValue = await doc.get();
    let evalBlockId: string | null = null;

    while (evalValue.type === "DocLink") {
      // follow doc ref with getDoc(evalValue.something)
    }

    if (evalValue.type === "BlockLink") {
      evalBlockId = evalValue.id;
      evalValue = await data.Actions.z.GetBlockJSON.call({ id: evalValue.id });
      // todo try this block json and fall back to BlockLink in case of binary file
    } else if (evalValue.type === "Blockchain") {
      evalBlockId = evalValue.head.id;
    }

    if (evalValue.type === "Commit") {
      const cachedResult = await cacheFiles.z.ReadJSON.call({
        path: `state/eval-${evalBlockId}`,
      });
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
        await cacheFiles.z.WriteJSON.call({
          path: `state/eval-${evalBlockId}`,
          value: evalValue,
        });
        // await _cacheBlocks(cachableBlocks);
      }

      // if (restTerms[0] === ".blocks") {
      //   const blockId = restTerms[1];
      //   return await getEvalBlock(blockId);
      // }
    }

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
        type: { const: actionKey },
        value: actionDef.schema,
      };
    }),
  };

  const AppendChain = createZAction(allActionsSchema, async (action) => {
    let on: string | null = null;
    const time = Date.now();
    const prevDoc = await data.Docs.getChild(docName);
    calculator.validateAction(action);
    const prevDocValue = await prevDoc?.get();
    if (prevDocValue !== undefined) {
      if (prevDocValue.type === "BlockLink" && prevDocValue.id) {
        on = (prevDocValue as BlockLink).id;
      } else
        throw new Error(
          `AppendChain only works when the doc is BlockLink type (to a Commit type block). Instead the "${docName}" doc is of type "${prevDocValue?.type}"`
        );
    }
    const commitValue: Commit<any> = {
      type: "Commit",
      value: action,
      on,
      message: "...",
      time,
    };
    const commitBlock = await data.Actions.z.CreateBlock.call({
      value: commitValue,
    });
    await data.Actions.z.SetDoc.call({
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
  });

  const CalculatedValue = createZGettable({} as const, async () => {
    return _getEval();
  });

  return createZContainer({
    AppendChain,
    CalculatedValue,
  });
}

const CoreChain = {
  createZChainState,
  createZChainStateCalculator,
};

export default CoreChain;
