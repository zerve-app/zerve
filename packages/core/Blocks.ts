export const BLOCK_ID_FORMATS = {
  z: { encoding: "hex", algorithm: "sha256" },
} as const;

export type JSONBlock = {
  jsonValue: string;
  value: any;
  valueBuffer: Buffer;
  hash: string;
  hashAlgorithm: "sha256";
  hashEncoding: "hex";
  id: string;
};
