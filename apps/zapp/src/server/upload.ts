import multer from 'multer'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { z } from 'zod'
import { inTmpDir } from './tmp'
import { getExtension } from 'mime'

export async function handleOneFileUpload<Token, Response = void>(
  req: NextApiRequest,
  res: NextApiResponse,
  tokenValidator: z.ZodType<Token>,
  handleFile: (
    file: {
      fieldname: string // 'file',
      originalname: string // 'userfoo.jpg',
      encoding: string // eg: '7bit',
      mimetype: string // eg:'image/jpeg',
      destination: string // dest path
      filename: string // dest filename including extension, multer does not upload with extensions
      path: string // full uploaded path
      size: number // bytes
      extension: string
    },
    token: Token
  ) => Promise<Response>
) {
  await inTmpDir(async (tmpDir) => {
    const upload = multer({ dest: tmpDir }).single('file')

    const file = await new Promise<{
      fieldname: string // 'file',
      originalname: string // 'userfoo.jpg',
      encoding: string // eg: '7bit',
      mimetype: string // eg:'image/jpeg',
      destination: string // dest path
      filename: string // dest filename including extension, multer does not upload with extensions
      path: string // full uploaded path
      size: number // bytes
    }>((resolve, reject) => {
      // @ts-expect-error multer expects express req and not NextApiRequest
      upload(req, res, (error) => {
        if (error) {
          reject(error)
        } else if (
          // @ts-expect-error multer adds file to req
          !req.file
        ) {
          reject(new Error('File not received'))
        } else {
          // @ts-expect-error multer adds file to req
          resolve(req.file)
        }
      })
    })
    const rawToken = req.body && JSON.parse(req.body.token)
    const token = tokenValidator.parse(rawToken)
    const extension = getExtension(file.mimetype)
    if (!extension) {
      throw new Error('File MIME type not detected')
    }
    const resp = await handleFile({ ...file, extension }, token)
    res.send(resp)
  })
}

handleOneFileUpload.apiRouteConfig = {
  api: {
    bodyParser: false,
  },
}
