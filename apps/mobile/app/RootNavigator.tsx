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
import DocScreen from "../screens/DocScreen";
import KitchenSinkScreen from "../screens/KitchenSinkScreen";
import NewConnectionScreen from "../screens/NewConnectionScreen";
import ConnectionInfoScreen from "../screens/ConnectionInfoScreen";
import NewDocScreen from "../screens/NewDocScreen";
import ZNodeScreen from "../screens/ZNodeScreen";
import ConnectionsScreen from "../screens/ConnectionsScreen";
import ErrorScreen from "../screens/ErrorScreen";

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
        name="NewDoc"
        component={NewDocScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="Doc"
        component={DocScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="ZNode"
        component={ZNodeScreen}
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
        name="SettingsStack"
        component={SettingsNavigator}
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
