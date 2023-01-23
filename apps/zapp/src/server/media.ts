import { PutObjectCommand, S3 } from '@aws-sdk/client-s3'
import { env } from 'src/env/server.mjs'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3({
  region: 'us-east-1', // s3 client lol what https://github.com/aws/aws-sdk-js-v3/issues/1845#issuecomment-754832210
  endpoint: env.S3_HOST,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
})

export function putObject(key: string, body: Buffer | string) {
  return s3.putObject({
    Bucket: env.S3_BUCKET,
    Key: key,
    Body: body,
  })
}

export async function destroyObject(key: string) {
  return await s3.deleteObject({
    Bucket: env.S3_BUCKET,
    Key: key,
  })
}

let settingCors: boolean | Promise<void> = false

async function setCors() {
  await s3.putBucketCors({
    Bucket: env.S3_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST'],
          AllowedOrigins: ['*'],
          ExposeHeaders: [],
        },
      ],
    },
  })
}

async function setCorsIfNeeded() {
  if (settingCors === true) return
  if (settingCors) return await settingCors
  settingCors = setCors()
    .then(() => {
      settingCors = true
    })
    .catch((e) => {
      settingCors = false
      throw e
    })
  return await settingCors
}

export async function getObjectPutURL(key: string) {
  await setCorsIfNeeded()
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    })
  )
  return url
}
