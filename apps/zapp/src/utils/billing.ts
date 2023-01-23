import { env } from 'src/env/server.mjs'

const isProd = env.NODE_ENV === 'production'

export type Plan = {
  key: string
  title: string
  listedPriceMonthly: number
  listedPriceYearly: number
  stripeProductId: string
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
  maxStorageGb: number
  maxNodes: number
  support: string
}

export const PLANS: ReadonlyArray<Plan> = [
  {
    key: 'indie',
    title: 'Indie Dev',
    listedPriceMonthly: 15,
    listedPriceYearly: 150,
    stripeProductId: 'prod_N8MjwEjK7yxTPa',
    stripePriceIdMonthly: isProd
      ? 'price_0MO60q05C7xNwv0sQ6YGc0hp'
      : 'price_0MO60P05C7xNwv0sX4pOLeLi',
    stripePriceIdYearly: isProd
      ? 'price_0MO60q05C7xNwv0svUCHeb99'
      : 'price_0MO60P05C7xNwv0sMvGVvNpI',
    maxStorageGb: 1,
    maxNodes: 10_000,
    support: 'Email Support',
  },
  {
    key: 'startup',
    title: 'Startup',
    listedPriceMonthly: 50,
    listedPriceYearly: 550,
    stripeProductId: 'prod_N8Mtj1JsHt2RqD',
    stripePriceIdMonthly: isProd
      ? 'price_0MO65905C7xNwv0s992D47Po'
      : 'price_0MO69F05C7xNwv0sj68og4zh',
    stripePriceIdYearly: isProd
      ? 'price_0MO65905C7xNwv0skpPuywzR'
      : 'price_0MO69F05C7xNwv0srdsEhWRJ',
    maxStorageGb: 5,
    maxNodes: 100_000,
    support: 'Email Support',
  },
] as const

export type PlansConfig = typeof PLANS
