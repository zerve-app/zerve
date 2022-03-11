import { AnyZed } from "./Zed";

export type ZService<Z extends AnyZed> = {
  startInstance: () => Promise<{ z: Z; stop: () => Promise<void> }>;
};

export function createZService<Z extends AnyZed>(
  startInstance: () => Promise<{ z: Z; stop: () => Promise<void> }>
): ZService<Z> {
  return {
    startInstance,
  };
}
