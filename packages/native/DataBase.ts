import {
  CryptoDigestAlgorithm,
  CryptoEncoding,
  digestStringAsync,
} from "expo-crypto";
import {
  BLOCK_ID_FORMATS,
  Commit,
  JSONBlock,
  NotFoundError,
} from "@zerve/core";
import stringify from "json-stable-stringify";
import { createNativeStorage } from "./Storage";

const nativeData = createNativeStorage({ id: "MainDB" });

export async function createJSONBlock(
  value: any,
  formatKey: keyof typeof BLOCK_ID_FORMATS = "z"
): Promise<JSONBlock> {
  const format = formatKey || "z";
  const { encoding, algorithm } = BLOCK_ID_FORMATS[format];
  const jsonValue = stringify(value, {
    space: 2,
  });

  const hash = await digestStringAsync(
    CryptoDigestAlgorithm.SHA256, // fix: use algorithm instead of hardcoded sha256
    jsonValue,
    { encoding: CryptoEncoding.HEX } // fix: use encoding instead of hardcoded hex
  );

  return {
    jsonValue,
    value,
    valueBuffer: Buffer.from(jsonValue),
    hash,
    hashAlgorithm: algorithm,
    hashEncoding: encoding,
    id: `${format}.${hash}`,
  };
}

type DocValue = undefined | { type: "BlockLink"; id: string };

function getDocNode(docName: string) {
  return nativeData.getStorageNode<DocValue>(`Docs/${docName}`, undefined);
}
export type ListedDoc = string;

const docList = nativeData.getStorageNode<string[]>("Docs:List", []);

function getBlockNode<BlockValue>(blockId: string, value: BlockValue) {
  return nativeData.getStorageNode<BlockValue>(`Docs/${blockId}`, value);
}

export function listDocs() {
  return docList.get();
}

const docListCache = new Set(docList.get());

export async function deleteDoc(name: string) {
  docList.mutate((list) => list.filter((docName: string) => docName !== name));
  const node = getDocNode(name);
  node.destroy();
}
export async function setDoc(name: string, value: DocValue) {
  if (!docListCache.has(name)) {
    docList.mutate((list) => {
      if (list.findIndex((item) => item === name) !== -1) return list;
      return [...list, name];
    });
    docListCache.add(name);
  }
  const node = getDocNode(name);
  node.set(value);
}
export async function getDoc(name: string) {
  const node = getDocNode(name);
  const value = node.get();
  return value;
}
export async function getBlockJSON<BlockValue>(
  id: string
): Promise<BlockValue> {
  const block = getBlockNode<BlockValue | undefined>(id, undefined);
  const value = block.get();
  if (value === undefined)
    throw new NotFoundError(
      "BlockNotFound",
      `Block id "${id}" not found in local storage`,
      { id }
    );
  return value;
}

export async function createBlock<Value>(value: Value) {
  const block = await createJSONBlock(value);

  const blockNode = getBlockNode<Value>(block.id, block.value);
  return block;
}

export async function deleteBlock(id: string) {
  const blockNode = getBlockNode(id, undefined);
  blockNode.destroy();
}

export async function dispatch<AppendValue>(
  name: string,
  value: AppendValue,
  message?: string
) {
  let on: string | null = null;
  const time = Date.now();
  const prevDoc = await getDoc(name);
  if (prevDoc?.id) {
    on = prevDoc.id;
  }
  // older junkier version, checks for bad condition..:
  // if (prevDoc.value !== undefined) {
  //   if (prevDoc.value.type === "BlockLink" && prevDoc.value.id) {
  //     on = (prevDoc.value as BlockLink).id;
  //   } else
  //     throw new Error(
  //       `dispatch only works when the doc is BlockLink type (to a Commit type block). Instead the "${name}" doc is of type "${prevDoc.value?.type}"`
  //     );
  // }
  const commitValue: Commit<typeof value> = {
    type: "Commit",
    value,
    on,
    message,
    time,
  };
  const commitBlock = await createBlock(commitValue);

  await setDoc(name, {
    type: "BlockLink",
    id: commitBlock.id,
  });
  return {
    on,
    time,
    commitId: commitBlock.id,
    name,
  };
}

export function useDocs() {
  return nativeData.useNodeState(docList);
}
