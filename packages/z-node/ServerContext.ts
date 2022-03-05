import { mkdirp, rm } from "fs-extra";

export type ServerContext = Awaited<ReturnType<typeof createServerContext>>;

export async function createServerContext(
  port: number,
  overrideDataDir?: string
) {
  const homeDir = process.env.HOME;
  const defaultZDataDir = `${homeDir}/.zerve`;

  const zDataDir = overrideDataDir || defaultZDataDir;
  await mkdirp(zDataDir);

  const blocksDir = `${zDataDir}/blocks`;
  await mkdirp(blocksDir);

  const docsDir = `${zDataDir}/docs`;
  await mkdirp(docsDir);

  const trashDir = `${zDataDir}/trash`;
  await mkdirp(trashDir);

  const cacheDir = `${zDataDir}/cache`;
  const stateCacheDir = `${zDataDir}/cache/state`;
  const blockCacheDir = `${zDataDir}/cache/blocks`;

  const shouldResetCache = true; // todo, lol obviously
  if (shouldResetCache) {
    try {
      await rm(cacheDir, { recursive: true });
    } catch (e: any) {
      if (e.code !== "ENOENT") throw e;
    }
    await mkdirp(cacheDir);
    await mkdirp(stateCacheDir);
    await mkdirp(blockCacheDir);
  }

  return {
    port,
    blocksDir,
    docsDir,
    trashDir,
    cacheDir,
    stateCacheDir,
    blockCacheDir,
  };
}
