import sharp from 'sharp'
import { putObject } from './media'

export async function uploadResizedSquareImage(filePath: string, size: number, baseKey: string) {
  await putObject(
    `${baseKey}.${size}.png`,
    await sharp(filePath).resize(size, size).png().toBuffer()
  )
}

export async function uploadAvatarImage(filePath: string, baseKey: string) {
  await uploadResizedSquareImage(filePath, 100, baseKey)
  await uploadResizedSquareImage(filePath, 800, baseKey)
}
