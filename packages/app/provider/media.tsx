import { env } from '../../../apps/zapp/src/env/client.mjs'

export function resolveAssetURL(source: string): string {
  if (source.startsWith('http')) return source
  return `${env.NEXT_PUBLIC_MEDIA_HOST}/${source}`
}

export function resolveSmallAvatarURL(source: string): string {
  return `${resolveAssetURL(source)}.100.png`
}

export function resolveLargeAvatarURL(source: string): string {
  return `${resolveAssetURL(source)}.800.png`
}
