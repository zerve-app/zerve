import { createHash } from 'crypto'
import { env } from 'src/env/server.mjs'

export function getOpaqueId(typeLabel: string, id: string): string {
  const opaqueId = createHash('md5')
    .update(`${env.OPAQUE_KEY}_${typeLabel}_${id}`, 'utf8')
    .digest('hex')
  return opaqueId
}
