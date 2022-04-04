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
  TestSort: undefined;
  TestUI: undefined;
  TestHistory: undefined;
  TestJSONInput: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  History: undefined;
  HistoryEvent: { eventId: string };
  NewFile: { connection: null | string };
  ChainHistory: { connection: null | string };
  ChainSchemas: { connection: null | string };
  ChainSchema: { connection: null | string; schema: string };
  Connection: { connection: string };
  ConnectionSetup: { connection: string };
  File: { connection: null | string; name: string };
  FileSchema: { connection: null | string; name: string };
  ZNode: { connection: null | string; path: string[] };
};

export type RootStackParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  SettingsStack: NavigatorScreenParams<SettingsStackParamList>;
  Error: { error: GenericError<any, any> };
  JSONInput: { value: any; schema: any; onValue?: (v: any) => void };
  RawValue: { value: any; title: string };
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
