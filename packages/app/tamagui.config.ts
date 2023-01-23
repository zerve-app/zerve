import { config } from '@zerve/config'

export type Conf = typeof config

declare module '@zerve/ui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default config
