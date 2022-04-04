import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";

import SettingsScreen from "../screens/SettingsScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import {
  HomeStackParamList,
  RootStackParamList,
  SettingsStackParamList,
} from "./Links";
import HomeScreen from "../screens/HomeScreen";
import FileScreen from "../screens/FileScreen";
import KitchenSinkScreen from "../screens/KitchenSinkScreen";
import NewConnectionScreen from "../screens/NewConnectionScreen";
import ConnectionInfoScreen from "../screens/ConnectionInfoScreen";
import NewFileScreen from "../screens/NewFileScreen";
import ZNodeScreen from "../screens/ZNodeScreen";
import ConnectionsScreen from "../screens/ConnectionsScreen";
import ErrorScreen from "../screens/ErrorScreen";
import RawValueScreen from "../screens/RawValueScreen";
import JSONInputScreen from "../screens/JSONInputScreen";
import TestSortScreen from "../screens/TestSortScreen";
import TestJSONInputScreen from "../screens/TestJSONInputScreen";
import TestUIScreen from "../screens/TestUIScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ConnectionScreen from "../screens/ConnectionScreen";
import { TestHistoryScreen } from "../screens/TestHistoryScreen";
import FileSchemaScreen from "../screens/FileSchemaScreen";
import ChainHistoryScreen from "../screens/ChainHistoryScreen";
import ChainSchemasScreen from "../screens/ChainSchemasScreen";
import ConnectionSetupScreen from "../screens/ConnectionSetupScreen";
import HistoryEventScreen from "../screens/HistoryEventScreen";
import ChainSchemaScreen from "../screens/ChainSchemaScreen";

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="Connection"
        component={ConnectionScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="NewFile"
        component={NewFileScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="File"
        component={FileScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="ChainHistory"
        component={ChainHistoryScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="ChainSchemas"
        component={ChainSchemasScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="ChainSchema"
        component={ChainSchemaScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="ConnectionSetup"
        component={ConnectionSetupScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="FileSchema"
        component={FileSchemaScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="ZNode"
        component={ZNodeScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="History"
        component={HistoryScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="HistoryEvent"
        component={HistoryEventScreen}
        options={DefaultScreenOptions}
      />
    </HomeStack.Navigator>
  );
}

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const DefaultScreenOptions = {
  headerShown: false,
  fullScreenGestureEnabled: true,
};

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="KitchenSink"
        component={KitchenSinkScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="TestSort"
        component={TestSortScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="TestUI"
        component={TestUIScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="TestHistory"
        component={TestHistoryScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="TestJSONInput"
        component={TestJSONInputScreen}
        options={DefaultScreenOptions}
      />
      <SettingsStack.Screen
        name="Connections"
        component={ConnectionsScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="NewConnection"
        component={NewConnectionScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="ConnectionInfo"
        component={ConnectionInfoScreen}
        options={DefaultScreenOptions}
      />
    </SettingsStack.Navigator>
  );
}

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="HomeStack"
        component={HomeNavigator}
        options={DefaultScreenOptions}
      />
      <RootStack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={DefaultScreenOptions}
      />
      <RootStack.Screen
        name="Error"
        component={ErrorScreen}
        options={DefaultScreenOptions}
      />
      <RootStack.Screen
        name="JSONInput"
        component={JSONInputScreen}
        options={{
          ...DefaultScreenOptions,
          presentation: "modal",
          statusBarStyle: "light",
          statusBarAnimation: "fade",
        }}
      />
      <RootStack.Screen
        name="SettingsStack"
        component={SettingsNavigator}
        options={{
          ...DefaultScreenOptions,
          presentation: "modal",
          statusBarStyle: "light",
          statusBarAnimation: "fade",
        }}
      />
      <RootStack.Screen
        name="RawValue"
        component={RawValueScreen}
        options={{
          ...DefaultScreenOptions,
          presentation: "modal",
          statusBarStyle: "light",
          statusBarAnimation: "fade",
        }}
      />
    </RootStack.Navigator>
  );
}
