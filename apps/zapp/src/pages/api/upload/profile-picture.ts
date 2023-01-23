import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerAuthSession } from '../../../server/common/get-server-auth-session'
import { prisma } from '../../../server/db/client'
import { createHash } from 'crypto'
import { z } from 'zod'
import { uploadAvatarImage } from 'src/server/image'
import { handleOneFileUpload } from 'src/server/upload'

export default async function UploadProfilePicture(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerAuthSession({ req, res })
  const user = session?.user
  if (!user) {
    throw new Error('not logged in')
  }
  handleOneFileUpload(req, res, z.null(), async (file) => {
    const userBasePath = createHash('md5').update(`account_${user.id}`, 'utf8').digest('hex')
    const avatarKey = `${userBasePath}/profile/${file.filename}`

    await uploadAvatarImage(file.path, avatarKey)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        image: avatarKey,
      },
    })

    return {
      avatarKey,
    }
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
