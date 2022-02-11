import { readFile, writeFile } from "fs-extra";

export async function writeJSONFile(path: string, json: any) {
  await writeFile(path, JSON.stringify(json));
}

export async function readJSONFile(path: string) {
  try {
    return JSON.parse(await readFile(path, { encoding: "utf8" }));
  } catch (e: any) {
    if (e.code === "ENOENT") return undefined;
    throw e;
  }
}
