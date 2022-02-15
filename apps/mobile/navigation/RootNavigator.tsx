import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";

import SettingsScreen from "../screens/SettingsScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import { RootStackParamList } from "./Links";
import HomeScreen from "../screens/HomeScreen";
import DocScreen from "../screens/DocScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Doc"
        component={DocScreen}
        options={({ route }) => ({ title: route.params.name })}
      />

      <RootStack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
      <RootStack.Group
        screenOptions={{
          presentation: "modal",
          headerShown: false,
        }}
      >
        <RootStack.Screen name="Settings" component={SettingsScreen} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}
