import { config } from "@zerve/tamagui-config";

export type Conf = typeof config;

declare module "@zerve/zen" {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;
