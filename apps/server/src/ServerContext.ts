import { mkdirp, rmdir } from "fs-extra";

export type ServerContext = Awaited<ReturnType<typeof createServerContext>>;

export async function createServerContext(
  port: number,
  overrideAgentDir?: string
) {
  const homeDir = process.env.HOME;
  const defaultAgentDir = `${homeDir}/.agent`;

  const agentDir = overrideAgentDir || defaultAgentDir;
  await mkdirp(agentDir);

  const blocksDir = `${agentDir}/blocks`;
  await mkdirp(blocksDir);

  const docsDir = `${agentDir}/docs`;
  await mkdirp(docsDir);

  const trashDir = `${agentDir}/trash`;
  await mkdirp(trashDir);

  const cacheDir = `${agentDir}/cache`;
  const stateCacheDir = `${agentDir}/cache/state`;
  const blockCacheDir = `${agentDir}/cache/blocks`;

  const shouldResetCache = true; // todo, lol obviously
  if (shouldResetCache) {
    try {
      await rmdir(cacheDir, { recursive: true });
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
