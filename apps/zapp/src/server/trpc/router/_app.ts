import { router } from '../trpc'
import { authRouter } from './auth'
import { billingRouter } from './billing'
import { entityRouter } from './entity'
import { projectRouter } from './project'
import { serversRouter } from './servers'

export const appRouter = router({
  auth: authRouter,
  entity: entityRouter,
  project: projectRouter,
  billing: billingRouter,
  servers: serversRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
