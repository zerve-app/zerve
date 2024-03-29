import {
  CompositeNavigationProp,
  CompositeScreenProps,
  LinkingOptions,
  NavigatorScreenParams,
} from "@react-navigation/native";
import * as Linking from "expo-linking";

import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { GenericError } from "@zerve/zed";
import { StoreNavigationState } from "../context/StoreDashboardContext";
import { PlaygroundFeatureName } from "../screens/ZenPlaygroundScreen";

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
  ZenPlayground: { feature: PlaygroundFeatureName | null };
  TestHistory: undefined;
  TestJSONInput: undefined;
};

export type HomeStackParamList = {
  StoreFeature: {
    connection: string;
    storePath: string[];
    feature: StoreNavigationState;
  };
  Home: undefined;
  History: undefined;
  HistoryEvent: { eventId: string };
  NewFile: { connection: null | string; storePath: string[] };
  StoreHistory: { connection: null | string; storePath: string[] };
  StoreSchemas: { connection: null | string; storePath: string[] };
  StoreSchema: {
    connection: null | string;
    storePath: string[];
    schema: string;
  };
  Connection: { connection: string };
  Entry: { connection: null | string; storePath: string[]; name: string };
  FileSchema: { connection: null | string; storePath: string[]; name: string };
  ZNode: { connection: null | string; path: string[] };
};

export type RootStackParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  SettingsStack: NavigatorScreenParams<SettingsStackParamList>;
  Error: { error: GenericError<any, any> };
  JSONInput: { value: any; schema: any; onValue?: (v: any) => void };
  RawValue: { value: any; title: string };
  AuthIn: { connection: string; path: string[] };
  NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootStackNavigationProps<Screen extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, Screen>;

export type HomeStackScreenProps<Screen extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, Screen>;

export type SettingsStackScreenProps<
  Screen extends keyof SettingsStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, Screen>,
  RootStackScreenProps<"SettingsStack">
>;

export type SettingsStackNavigationProps<
  Screen extends keyof SettingsStackParamList,
> = CompositeNavigationProp<
  NativeStackNavigationProp<SettingsStackParamList, Screen>,
  RootStackNavigationProps<"SettingsStack">
>;

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
