import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { TRPCError } from '@trpc/server'
import { env } from 'src/env/server.mjs'
import { destroyObject, getObjectPutURL } from 'src/server/media'
import { getOpaqueId } from 'src/server/opaque'
import { z } from 'zod'

import { router, protectedProcedure } from '../trpc'

const projectSelectInput = z.object({
  projectKey: z.string(),
  entityKey: z.string(),
})

function getAssetKey(
  entityId: string,
  projectId: string,
  asset: {
    id: string
    extension: string
  }
) {
  return `${getOpaqueId('entity', entityId)}/p.${projectId}/${getOpaqueId('asset', asset.id)}.${
    asset.extension
  }`
}

export const projectRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        entityKey: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma, session } = ctx
      const { entityKey } = input
      if (!session) throw new Error('no session')
      const { user } = session
      if (!user) throw new Error('no user')
      // check permissions, make sure user is allowed to list projects. (only list public projects)
      const data = await prisma.project.findMany({
        where: {
          entityId: entityKey,
        },
        select: {
          key: true,
        },
      })
      return data
    }),

  //   get: publicProcedure.input(z.object({ key: z.string() })).query(async ({ ctx, input }) => {
  //     const { prisma, session } = ctx
  //     const data = await prisma.entity.findFirst({
  //       where: { key: input.key },
  //       select: {
  //         name: true,
  //         key: true,
  //         owner: { select: { id: true } },
  //         projects: { select: { key: true } },
  //       },
  //     })
  //     if (data?.owner.id === session?.user?.id) {
  //       // entity is owned by user
  //     }
  //     // the entity name is considered public
  //     return data
  //   }),

  create: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        entityKey: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx
      if (!session) throw new Error('no session')
      const { user } = session
      if (!user) throw new Error('no user')
      console.log('create project', input)
      // check permissions: entity.project.create
      try {
        await prisma.project.create({
          data: {
            entity: { connect: { key: input.entityKey } },
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

  destroy: protectedProcedure.input(projectSelectInput).mutation(async ({ ctx, input }) => {
    const { prisma, session } = ctx
    if (!session) throw new Error('no session')
    const { user } = session
    if (!user) throw new Error('no user')
    console.log('delete project', input)
    // check permissions: entity.project.delete
    const entity = await prisma.entity.findFirst({
      where: {
        key: input.entityKey,
      },
      select: { id: true },
    })
    if (!entity) throw new Error('entity not found')
    await prisma.project.delete({
      where: {
        entityId_key: {
          key: input.projectKey,
          entityId: entity.id,
        },
      },
    })
    return []
  }),

  assets: protectedProcedure.input(projectSelectInput).query(async ({ ctx, input }) => {
    const proj = await ctx.prisma.project.findFirst({
      where: {
        key: input.projectKey,
        entity: {
          key: input.entityKey,
        },
      },
      select: {
        id: true,
        entity: {
          select: { id: true },
        },
        assets: {
          orderBy: {
            key: 'asc',
          },
          select: {
            key: true,
            id: true,
            extension: true,
            contentType: true,
            size: true,
          },
        },
      },
    })
    if (!proj) return null
    const assets = proj?.assets.map((asset) => {
      const assetKey = `${getOpaqueId('entity', proj.entity.id)}/p.${proj.id}/${getOpaqueId(
        'asset',
        asset.id
      )}.${asset.extension}`
      return {
        id: asset.id,
        key: asset.key,
        contentType: asset.contentType,
        extension: asset.extension,
        size: asset.size,
        url: `${env.NEXT_PUBLIC_MEDIA_HOST}/${assetKey}`,
      }
    })
    return {
      assets,
    }
  }),

  uploadAsset: protectedProcedure
    .input(
      z.object({
        projectKey: z.string(),
        entityKey: z.string(),
        name: z.string(),
        contentType: z.string(),
        extension: z.string(),
        size: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { projectKey, entityKey, name, contentType, extension, size } = input

      const project = await ctx.prisma.project.findFirst({
        where: {
          key: projectKey,
          entity: {
            key: entityKey,
          },
        },
        select: {
          id: true,
          entity: {
            select: { id: true },
          },
        },
      })

      if (!project) throw new Error('project not found')

      const asset = await ctx.prisma.projectAsset.create({
        data: {
          project: { connect: { id: project.id } },
          key: name,
          contentType,
          extension,
          size,
        },
        select: {
          id: true,
        },
      })
      const assetKey = getAssetKey(project.entity.id, project.id, { id: asset.id, extension })
      const putUrl = await getObjectPutURL(assetKey)

      console.log({ putUrl, asset, assetKey, extension })

      return { putUrl, asset, assetKey }
    }),

  destroyAsset: protectedProcedure
    .input(
      z.object({
        projectKey: z.string(),
        entityKey: z.string(),
        assetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx
      if (!session) throw new Error('no session')
      const { user } = session
      if (!user) throw new Error('no user')
      // check permissions: project.asset.delete
      const asset = await prisma.projectAsset.findFirst({
        where: {
          id: input.assetId,
          project: {
            key: input.projectKey,
            entity: {
              key: input.entityKey,
            },
          },
        },
        select: {
          id: true,
          extension: true,
        },
      })
      if (!asset) throw new TRPCError({ code: 'BAD_REQUEST', message: 'asset not found' })
      const assetKey = getAssetKey(input.entityKey, input.projectKey, asset)
      await destroyObject(assetKey)
      await prisma.projectAsset.delete({
        where: { id: input.assetId },
      })
    }),
})
