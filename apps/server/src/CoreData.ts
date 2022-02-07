import { join } from "path";

import { createJSONBlock } from "agent-crypto";
import { mkdirp, readFile, readdir, rename, stat, writeFile } from "fs-extra";

import * as Actions from "./actions";

export type ServerActions = {
  CreateBlock: { value: any };
  SetRef: { name: string; value: any };
  DeleteRef: { name: string };
  DeleteBlock: { id: string };
};

export type BlockRef = {
  type: "BlockRef";
  id: string;
};

export type ServerContext = {
  blocksDir: string;
  refsDir: string;
  trashDir: string;
  port: number;
};

export async function createServerContext(
  port: number,
  overrideAgentDir?: string
): Promise<ServerContext> {
  const homeDir = process.env.HOME;
  const defaultAgentDir = `${homeDir}/.agent`;

  const agentDir = overrideAgentDir || defaultAgentDir;
  await mkdirp(agentDir);

  const blocksDir = `${agentDir}/blocks`;
  await mkdirp(blocksDir);

  const refsDir = `${agentDir}/refs`;
  await mkdirp(refsDir);

  const trashDir = `${agentDir}/trash`;
  await mkdirp(trashDir);

  return { port, blocksDir, refsDir, trashDir };
}

export function createCoreData({
  blocksDir,
  refsDir,
  trashDir,
}: ServerContext) {
  async function createBlock(
    payload: ServerActions["SetRef"]
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

  async function setRef(payload: ServerActions["SetRef"]) {
    const refFile = join(refsDir, payload.name);
    await writeFile(refFile, JSON.stringify(payload.value));
    return {};
  }

  async function deleteRef(payload: ServerActions["DeleteRef"]) {
    const refFile = join(refsDir, payload.name);
    const trashedFile = join(trashDir, `ref-${payload.name}`);
    await rename(refFile, trashedFile);
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

  async function listRefs() {
    const refList = await readdir(refsDir);
    return { children: refList };
  }

  async function dispatch<ActionType extends keyof ServerActions>(
    actionType: ActionType,
    actionPayload: ServerActions[ActionType]
  ) {
    switch (actionType) {
      case "CreateBlock":
        return await createBlock(actionPayload as any);
      case "SetRef":
        return await setRef(actionPayload as any);
      case "DeleteRef":
        return await deleteRef(actionPayload as any);
      case "DeleteBlock":
        return await deleteBlock(actionPayload as any);
    }
  }

  async function getEval(evalPath: string) {
    console.log("EVAL! evalPath: ", evalPath);
    return {
      response: {},
    };
  }

  async function getRef(name: string) {
    const refFile = join(refsDir, name);
    const fileValue = await readFile(refFile);
    const value = JSON.parse(fileValue.toString("utf-8"));
    return { value, name };
  }

  return {
    createBlock,
    setRef,
    deleteRef,
    getRef,
    getEval,
    deleteBlock,
    listBlocks,
    listRefs,
    dispatch,
  };
}
