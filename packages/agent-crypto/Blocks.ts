import { createHash } from "crypto";

import stringify from "json-stable-stringify";

const BLOCK_ID_FORMATS = {
  z: { encoding: "hex", algorithm: "sha256" },
} as const;

export type JSONBlock = Awaited<ReturnType<typeof createJSONBlock>>;

export async function createJSONBlock(
  value: any,
  formatKey: keyof typeof BLOCK_ID_FORMATS = "z"
) {
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
