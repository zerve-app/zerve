import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
// import { setToken, createLinode } from '@linode/api-v4'
import fetch from 'node-fetch'

// setToken(env.LINODE_TOKEN)

import { router, protectedProcedure, publicProcedure } from '../trpc'
import { env } from 'src/env/server.mjs'

export const serversRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        entityKey: z.string().min(1),
        projectKey: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx
      if (!session) throw new Error('no session')
      const { user } = session
      if (!user) throw new Error('no user')
      const res = await fetch('https://api.linode.com/v4/linode/instances', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.LINODE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'g6-nanode-1',
          region: 'eu-central',
          image: 'linode/debian11',
          root_pass: 'password',
        }),
      })
      const server = await res.json()
      //   const server = await createLinode({
      //     type: 'g6-nanode-1',
      //     region: 'eu-central',
      //     image: 'linode/debian11',
      //     root_pass: 'password',
      //   })
      console.log('hello servers', input, server)
    }),
})
