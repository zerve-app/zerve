import { join } from 'path'
import { tmpdir } from 'os'
import { mkdirp, remove } from 'fs-extra'

let tmpId = 1

export async function acquireTmpDir() {
  const tmp = tmpdir()
  const tmpDir = join(tmp, `tmp-${tmpId}`)
  tmpId += 1
  await mkdirp(tmpDir)
  return {
    path: tmpDir,
    release: async () => {
      await remove(tmpDir)
    },
  }
}

export async function inTmpDir<V>(handler: (tmpDirPath: string) => Promise<V>): Promise<V> {
  const tmpDir = await acquireTmpDir()
  return await handler(tmpDir.path).finally(() => tmpDir.release())
}
