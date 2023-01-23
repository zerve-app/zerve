import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { TRPCError } from '@trpc/server'
import { getRandomValues, randomBytes } from 'crypto'
import { env } from 'src/env/server.mjs'
import { sendSimpleEmail } from 'src/server/email'
import { string, z } from 'zod'

import { router, protectedProcedure, publicProcedure } from '../trpc'

export const entityRouter = router({
  isEntityAvailable: protectedProcedure.input(z.string()).query(({ input }) => {
    const normalInput = input.toLowerCase()
    return normalInput !== 'admin'
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const { prisma, session } = ctx
    if (!session) throw new Error('no session')
    const { user } = session
    if (!user) throw new Error('no user')
    const memberships = await prisma.entityMembership.findMany({
      where: {
        userId: user.id,
      },
      select: {
        isEntityAdmin: true,
        entity: {
          select: {
            key: true,
            name: true,
            image: true,
          },
        },
      },
    })
    return memberships.map((membership) => ({
      key: membership.entity.key,
      name: membership.entity.name,
      image: membership.entity.image,
      isEntityAdmin: membership.isEntityAdmin,
    }))
  }),
  destroy: protectedProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx
      if (!session) throw new Error('no session')
      const { user } = session
      if (!user) throw new Error('no user')
      await prisma.entity.delete({
        where: {
          key: input.key,
        },
      })
    }),
  get: publicProcedure.input(z.object({ key: z.string() })).query(async ({ ctx, input }) => {
    const { prisma } = ctx
    const data = await prisma.entity.findFirst({
      where: { key: input.key },
      select: {
        name: true,
        key: true,
        members: {
          where: { isEntityAdmin: true },
          select: { id: true, user: { select: { name: true } } },
        },
        projects: { select: { key: true } },
      },
    })
    return data
  }),
  getInfo: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const { prisma } = ctx
    const data = await prisma.entity.findFirst({
      where: { key: input },
      select: {
        name: true,
        image: true,
        key: true,
      },
    })
    return data
  }),
  create: protectedProcedure
    .input(
      z.object({
        key: z.string().min(1),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx
      if (!session) throw new Error('no session')
      const { user } = session
      if (!user) throw new Error('no user')
      try {
        await prisma.entity.create({
          data: {
            members: { create: { user: { connect: { id: user.id } }, isEntityAdmin: true } },
            name: input.name,
            key: input.key,
          },
        })
      } catch (e: unknown) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Entity already exists',
              cause: e,
            })
          } else throw e
        }
      }
      return []
    }),
  listInvites: protectedProcedure.query(async ({ ctx, input }) => {
    const { prisma, session } = ctx
    if (!session) throw new Error('no session')
    const { user } = session
    if (!user) throw new Error('no user')
    let invites: {
      entity: { key: string; name: string; image: string | null }
      createdAt: Date
      fromUser: { name: string | null }
      token: string
    }[] = []
    if (user.email) {
      invites = await prisma.entityTeamInvite.findMany({
        where: {
          email: user.email,
        },
        select: {
          createdAt: true,
          token: true,
          fromUser: {
            select: {
              name: true,
            },
          },
          entity: {
            select: {
              key: true,
              name: true,
              image: true,
            },
          },
        },
      })
    }
    return { invites }
  }),
  revokeInvite: protectedProcedure
    .input(
      z.object({
        entityKey: z.string(),
        inviteId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx
      const { entityKey, inviteId } = input
      await prisma.entityTeamInvite.delete({
        where: { id: inviteId },
      })
    }),
  createTeam: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        entityKey: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx
      const { name, entityKey } = input
      const team = await prisma.entityTeam.create({
        data: {
          key: name,
          entity: {
            connect: {
              key: entityKey,
            },
          },
        },
        select: {
          id: true,
        },
      })
      return team
    }),
  listTeams: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const { prisma } = ctx
    const invites = await prisma.entityTeamInvite.findMany({
      where: {
        entity: { key: input },
      },
      select: {
        email: true,
        id: true,
      },
    })
    const teams = await prisma.entityTeam.findMany({
      where: { entity: { key: input } },
      select: {
        id: true,
        key: true,
      },
    })
    const members = await prisma.entityMembership.findMany({
      where: { entity: { key: input } },
      select: {
        isEntityAdmin: true,
        user: {
          select: {
            id: true,
            image: true,
            name: true,
          },
        },
      },
    })
    return { invites, members, teams }
  }),
  inviteMember: protectedProcedure
    .input(
      z.object({
        entityKey: z.string().min(1),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // make sure user is allowed to invite to this org, lol!
      const { session, prisma } = ctx
      const { email, entityKey } = input
      const userId = session?.user?.id
      if (!userId)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'nope',
        })

      const token = randomBytes(20).toString('hex')
      await prisma.entityTeamInvite.create({
        data: {
          entity: {
            connect: {
              key: entityKey,
            },
          },
          email,
          fromUser: {
            connect: {
              id: userId,
            },
          },
          token,
        },
      })
      await sendSimpleEmail(
        email,
        `You have been invited to ${entityKey}`,
        `Welcome to ${entityKey}! Click this: ${env.NEXTAUTH_URL}/invite/${token}`
      )
    }),
  lookupInvite: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const { prisma } = ctx
    const invite = await prisma.entityTeamInvite.findFirst({
      where: {
        token: input,
      },
      select: {
        id: true,
        email: true,
        entity: {
          select: {
            name: true,
            key: true,
          },
        },
      },
    })
    return invite
  }),
  inviteRespond: protectedProcedure
    .input(
      z.object({
        inviteToken: z.string(),
        accept: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return null
    }),
  setName: protectedProcedure
    .input(
      z.object({
        key: z.string().min(1),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx

      await prisma.entity.update({
        where: {
          key: input.key,
        },
        data: {
          name: input.name,
        },
      })
    }),
})
