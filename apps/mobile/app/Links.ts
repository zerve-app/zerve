import {
  LinkingOptions,
  NavigatorScreenParams,
} from "@react-navigation/native";
import * as Linking from "expo-linking";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { GenericError } from "@zerve/core";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type SettingsStackParamList = {
  Settings: undefined;
  Connections: undefined;
  NewConnection: undefined;
  ConnectionInfo: { connection: string };
  KitchenSink: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  NewDoc: undefined;
  Doc: { connection: null | string; name: string };
};

export type RootStackParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  SettingsStack: NavigatorScreenParams<SettingsStackParamList>;
  Error: { error: GenericError<any, any> };
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
