import type { NextApiRequest, NextApiResponse } from 'next'
import { env } from 'src/env/server.mjs'
import { stripe } from 'src/server/trpc/router/billing'
import type { Readable } from 'stream'
import type Stripe from 'stripe'
import { prisma } from '../../../server/db/client'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable: Readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

async function handleSubscription(subscription: Stripe.Subscription) {
  const metadata = subscription.metadata
  const { entityId, planKey } = metadata
  await prisma.entity.update({
    where: { id: entityId },
    data: {
      subscriptionId: subscription.id,
      subscriptionPlanKey: planKey,
      subscriptionStatus: subscription.status,
    },
  })
}

async function handleSubscriptionUpdated(event: any) {
  await handleSubscription(event.data.object)
}

async function handleSubscriptionDeleted(event: any) {
  await handleSubscription(event.data.object)
}

async function handleSubscriptionCreated(event: any) {
  await handleSubscription(event.data.object)
}

async function handleStripeEvent(event: any) {
  switch (event.type) {
    case 'customer.subscription.created':
      return await handleSubscriptionCreated(event)
    case 'customer.subscription.updated':
      return await handleSubscriptionUpdated(event)
    case 'customer.subscription.deleted':
      return await handleSubscriptionDeleted(event)
    case 'customer.subscription.pending_update_applied':
      return await handleSubscription(event.data.object)
    case 'customer.subscription.pending_update_expired':
      return await handleSubscription(event.data.object)
    case 'customer.subscription.trial_will_end':
      return await handleSubscription(event.data.object)
    default: {
      console.log('STRIPE unknown event: ' + event.type, event)
      return
    }
  }
}

export default async function StripeEvent(req: NextApiRequest, res: NextApiResponse) {
  const payload = await buffer(req)
  const sig = req.headers['stripe-signature']
  let event
  try {
    if (!sig) throw new Error('stripe-signature header not provided')
    event = stripe.webhooks.constructEvent(payload.toString(), sig, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  await handleStripeEvent(event)

  res.send({})
}
