import { AnyZed } from "./Zed";

export type ZService<Z extends AnyZed, StartArgument> = {
  startInstance: (
    s: StartArgument
  ) => Promise<{ z: Z; stop: () => Promise<void> }>;
};

export function createZService<Z extends AnyZed, StartArgument>(
  startInstance: (
    s: StartArgument
  ) => Promise<{ z: Z; stop: () => Promise<void> }>
): ZService<Z, StartArgument> {
  return {
    startInstance,
  };
}
