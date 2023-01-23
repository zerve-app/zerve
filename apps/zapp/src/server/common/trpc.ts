import type { GetServerSidePropsContext } from 'next'
import { appRouter } from '../trpc/router/_app'
import { getServerAuthSession } from './get-server-auth-session'
import { prisma } from '../db/client'

export async function getServerTrpc(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx)
  const trpc = appRouter.createCaller({ session, prisma: prisma })
  return { trpc, session }
}
