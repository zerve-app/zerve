import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type SettingsStackParamList = {
  Settings: undefined;
  KitchenSink: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  NewConnection: undefined;
  Connection: { connection: string };
  Doc: { name: string };
};

export type RootStackParamList = {
  HomeStack: undefined;
  SettingsStack: undefined;
  NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type HomeStackScreenProps<Screen extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, Screen>;

export type SettingsStackScreenProps<
  Screen extends keyof SettingsStackParamList
> = NativeStackScreenProps<SettingsStackParamList, Screen>;

export const navigationLinking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.makeUrl("/")],
  config: {
    screens: {
      HomeStack: "",
      SettingsStack: "settings",
      NotFound: "*",
    },
  },
};
