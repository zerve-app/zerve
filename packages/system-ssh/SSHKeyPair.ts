import spawn from "@expo/spawn-async";
import { createZAction, FromSchema, NullSchema } from "@zerve/core";
import { unlink, readFile } from "fs-extra";
import { join } from "path";

const processTag = `${Date.now()}`;
let keyGenIndex = 0;

function getUniqueKeyId() {
  keyGenIndex += 1;
  return `genKey.${processTag}.${keyGenIndex}`;
}

const KeyPairSchema = {
  type: "object",
  properties: {
    publicKey: { type: "string" },
    privateKey: { type: "string" },
  },
  additionalProperties: false,
  required: ["publicKey", "privateKey"],
} as const;
export type KeyPair = FromSchema<typeof KeyPairSchema>;

export const zCreateKeyPair = createZAction(
  NullSchema,
  KeyPairSchema,
  createKeyPair,
);

export async function createKeyPair(): Promise<KeyPair> {
  const keyFileName = getUniqueKeyId();
  const privateKeyFilePath = join("/tmp", keyFileName);
  const publicKeyFilePath = join("/tmp", `${keyFileName}.pub`);
  await spawn("ssh-keygen", [
    "-b",
    "4096",
    "-t",
    "rsa",
    "-f",
    privateKeyFilePath,
    "-q",
    "-N",
    "",
    "-C",
    "do-tmp",
  ]);
  const privateKey = await readFile(privateKeyFilePath, { encoding: "utf8" });
  const publicKey = await readFile(publicKeyFilePath, { encoding: "utf8" });
  await unlink(privateKeyFilePath);
  await unlink(publicKeyFilePath);
  return { privateKey, publicKey };
}
