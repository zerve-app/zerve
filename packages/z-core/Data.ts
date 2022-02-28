import { JSONBlock } from "./Blocks";

export type Commit<V> = {
  type: "Commit";
  on: string | null;
  value: V;
  message?: string;
  time: number;
};

export type Chain = {
  type: "Chain";
  head: BlockLink;
  // eval: 'FileTree' |

  // todo, add eval settings such as cache pruning behavior
};

export type DeepBlockState = any;

export type BlockCache = Map<string, JSONBlock>;

export type BlockLink = {
  type: "BlockLink";
  id: string;
};
export type Block = {
  type: "Block";
  jsonValue: any;
};

export type TreeState<V> = {
  value: V;
  children: Record<string, Block | BlockLink>;
};
