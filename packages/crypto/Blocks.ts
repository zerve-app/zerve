import { createHash } from "crypto";
import { BLOCK_ID_FORMATS, JSONBlock } from "@zerve/core";

import stringify from "json-stable-stringify";

export async function createJSONBlock(
  value: any,
  formatKey: keyof typeof BLOCK_ID_FORMATS = "z"
): Promise<JSONBlock> {
  const format = formatKey || "z";
  const { encoding, algorithm } = BLOCK_ID_FORMATS[format];
  const jsonValue = stringify(value, {
    space: 2,
  });

  const hash = createHash(algorithm)
    .update(jsonValue, "utf8")
    .digest()
    .toString(encoding);

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
