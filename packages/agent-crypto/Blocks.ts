import stringify from "json-stable-stringify";
import { createHash } from "crypto";

const HASH_ENCODING = 'hex'
const HASH_FORMAT = 'sha256'

export async function createJSONBlock(value: any) {

  const jsonValue = stringify(value, {
    space: 2,
  });

  const hash = createHash(HASH_FORMAT).update(jsonValue, "utf8").digest().toString(HASH_ENCODING);

  return { jsonValue, value, hash, hashAlgorithm: HASH_FORMAT, hashEncoding: HASH_ENCODING };
}
