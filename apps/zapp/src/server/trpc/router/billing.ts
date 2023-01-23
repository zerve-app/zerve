import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import Stripe from 'stripe'
import { router, protectedProcedure } from '../trpc'
import { env } from 'src/env/server.mjs'
import { type Plan, PLANS } from 'src/utils/billing'

const zPlanKey = z.union([z.literal('indie'), z.literal('startup')])

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})

export const billingRouter = router({
  state: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const { session, prisma } = ctx

    const entity = await prisma.entity.findUnique({
      where: {
        key: input,
      },
      select: {
        id: true,
        subscriptionId: true,
        subscriptionPlanKey: true,
        subscriptionStatus: true,
        billingUser: {
          select: {
            id: true,
            stripeCustomerId: true,
            name: true,
            image: true,
          },
        },
      },
    })
    const billingUser = entity?.billingUser
      ? {
          name: entity?.billingUser.name,
          image: entity?.billingUser.image,
          id: entity?.billingUser.id,
        }
      : null
    if (entity?.subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(entity.subscriptionId)
      return {
        subscription,
        planKey: entity.subscriptionPlanKey,
        status: entity.subscriptionStatus,
        plan: PLANS.find((plan) => plan.key === entity.subscriptionPlanKey) as Plan | undefined,
        billingUser,
      }
    }
    return {
      subscription: null,
      billingUser,
    }
  }),
  manage: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const { session, prisma } = ctx
    const entityKey = input
    const entity = await prisma.entity.findUnique({
      where: {
        key: entityKey,
      },
      select: {
        id: true,
        billingUser: {
          select: {
            id: true,
            stripeCustomerId: true,
          },
        },
      },
    })

    if (entity?.billingUser?.id !== session.user.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authorized',
      })
    }
    if (!entity?.billingUser?.stripeCustomerId) {
      throw new TRPCError({
        code: 'NOT_FOUND',

        message: 'Stripe customer not set up',
      })
    }
    const configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Test headline..',
      },
      features: { invoice_history: { enabled: true } },
    })
    const billingSession = await stripe.billingPortal.sessions.create({
      customer: entity.billingUser.stripeCustomerId,
      return_url: `${env.NEXTAUTH_URL}/${entityKey}/settings/billing`,
    })
    console.log('so then..', configuration, billingSession)
    return {
      url: billingSession.url,
    }
  }),
  start: protectedProcedure
    .input(
      z.object({
        planKey: zPlanKey,
        entityKey: z.string().min(1),
        isYearly: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { entityKey, planKey, isYearly } = input
      const { session, prisma } = ctx
      const user = session?.user

      const plan = PLANS.find((p) => p.key === planKey)
      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan not found',
        })
      }
      const priceId = isYearly ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly

      if (!user)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found',
        })
      const entity = await prisma.entity.findUnique({
        where: {
          key: entityKey,
        },
        select: {
          id: true,
          billingUser: {
            select: {
              id: true,
            },
          },
        },
      })

      async function getUserStripeCustomerId(): Promise<string> {
        const savedUser = await prisma.user.findUnique({
          where: {
            id: user.id,
          },
          select: {
            id: true,
            stripeCustomerId: true,
            email: true,
            emailVerified: true,
          },
        })
        if (!savedUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }
        if (savedUser.stripeCustomerId) {
          return savedUser.stripeCustomerId
        }
        const { id } = await stripe.customers.create({
          email: savedUser.emailVerified && savedUser.email ? savedUser.email : undefined,
        })
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            stripeCustomerId: id,
          },
        })
        return id
      }

      const stripeCustomerId = await getUserStripeCustomerId()

      if (!entity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entity not found',
        })
      }

      const billingUserId = entity.billingUser?.id
      if (billingUserId && billingUserId !== session?.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not the billing user for this entity',
        })
      }

      if (!billingUserId) {
        await prisma.entity.update({
          where: {
            key: entityKey,
          },
          data: {
            billingUser: {
              connect: {
                id: user.id,
              },
            },
          },
        })
      }

      const checkout = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        subscription_data: {
          description: `Subscription for ${entityKey}`,
          metadata: {
            userId: user.id,
            entityId: entity.id,
            planKey,
          },
        },
        customer_email: user.email || undefined,
        customer: stripeCustomerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${env.NEXTAUTH_URL}/${entityKey}/settings/billing`,
        cancel_url: `${env.NEXTAUTH_URL}/${entityKey}/settings/billing`,
      })

      console.log('LEts goo?!?!', stripeCustomerId, checkout)

      // const customer = await stripe.customers.create({
      //   email: 'foo@bar.com',
      // })
      // console.log(customer)
      return {
        url: checkout.url,
      }
    }),
})
