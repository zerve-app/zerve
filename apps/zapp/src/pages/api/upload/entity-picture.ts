import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerAuthSession } from '../../../server/common/get-server-auth-session'
import { prisma } from '../../../server/db/client'
import { createHash } from 'crypto'
import { z } from 'zod'
import { uploadAvatarImage } from 'src/server/image'
import { handleOneFileUpload } from 'src/server/upload'

export default async function UploadEntityPicture(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerAuthSession({ req, res })
  const user = session?.user
  if (!user) {
    throw new Error('not logged in')
  }
  // to do: permissions check
  handleOneFileUpload(
    req,
    res,
    z.object({
      entityKey: z.string(),
    }),
    async (file, { entityKey }) => {
      const entityBasePath = createHash('md5').update(`entity_${entityKey}`, 'utf8').digest('hex')
      const avatarKey = `${entityBasePath}/profile/${file.filename}`

      await uploadAvatarImage(file.path, avatarKey)

      await prisma.entity.update({
        where: { key: entityKey },
        data: {
          image: avatarKey,
        },
      })

      return {
        avatarKey,
      }
    }
  )
}

export const config = {
  api: {
    bodyParser: false,
  },
}
