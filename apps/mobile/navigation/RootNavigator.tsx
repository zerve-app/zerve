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
        name="Doc"
        component={DocScreen}
        options={DefaultScreenOptions}
      />
      <HomeStack.Screen
        name="NewConnection"
        component={NewConnectionScreen}
        options={DefaultScreenOptions}
      />
    </HomeStack.Navigator>
  );
}

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const DefaultScreenOptions = {
  headerShown: false,
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
        name="SettingsStack"
        component={SettingsNavigator}
        options={{ ...DefaultScreenOptions, presentation: "modal" }}
      />
    </RootStack.Navigator>
  );
}
