import { join } from "path";

import { createJSONBlock } from "agent-crypto";
import { mkdirp, readFile, readdir, rename, stat, writeFile } from "fs-extra";

import { Actions } from "./actions";
import { ServerContext } from "./ServerContext";

export type ServerActions = {
  CreateBlock: { value: any };
  SetDoc: { name: string; value: any };
  DeleteDoc: { name: string };
  DeleteBlock: { id: string };
  AppendChain: { name: string; value: any; message?: string };
  GetBlockJSON: { id: string };
};

export type BlockRef = {
  type: "BlockRef";
  id: string;
};

export type Commit<V> = {
  type: "Commit";
  on: string | null;
  value: V;
  message?: string;
  time: number;
};

export function createCoreData(
  { blocksDir, docsDir, trashDir }: ServerContext,
  onNextDispatch: (
    anonActionType: any, // crap, string??? wtf
    anonActionPayload: any // whopsie any!!
  ) => Promise<any> // whopsie any!!
) {
  async function createBlock(
    payload: ServerActions["CreateBlock"]
  ): Promise<BlockRef> {
    const block = await createJSONBlock(payload.value);
    const blockFile = join(blocksDir, block.id);
    try {
      const blockFilePrev = await stat(blockFile);
      if (blockFilePrev.size !== block.valueBuffer.byteLength)
        throw new Error("Persisted block does not match!");
    } catch (e) {
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

  type TreeState<V> = {
    value: V;
    children: Record<string, BlockRef>;
  };

  async function evalCommitStep<V>(
    state: TreeState<any>,
    action: any
  ): Promise<TreeState<any>> {
    return {
      value: null,
      children: {},
    };
  }

  async function evalCommitChain<V>(commitValue: Commit<V>) {
    const blocksInChain = await rollupBlocksInCommitChain(commitValue);
    let walkReduceValue: any = undefined;
    for (
      let blockIndex = blocksInChain.length - 1;
      (blockIndex -= 1);
      blockIndex >= 0
    ) {
      const stepBlock = blocksInChain[blockIndex];
      const nextValue = await evalCommitStep(walkReduceValue, stepBlock);
      walkReduceValue = nextValue;
    }
    return walkReduceValue;
  }

  async function getEval(evalPath: string) {
    // cache shit here!!

    const evalPathTerms = evalPath.split("/");
    const [thisPathTerm, ...restTerms] = evalPathTerms;
    const doc = await getDoc(thisPathTerm);

    let evalValue = doc.value;
    let contextId: string | null = null;

    while (evalValue.type === "DocRef") {
      // follow doc ref with getDoc(evalValue.something)
    }
    if (evalValue.type === "BlockRef") {
      contextId = evalValue.id;
      evalValue = await getBlockJSON({ id: evalValue.id });
      // todo try this block json and fall back to BlockRef in case of binary file
    }

    if (evalValue.type === "Commit") {
      return {
        response: await evalCommitChain(evalValue),
      };
    }

    return {
      response: evalValue,
    };
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
