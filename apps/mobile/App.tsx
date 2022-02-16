import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import { navigationLinking } from "./navigation/Links";
import RootNavigator from "./navigation/RootNavigator";
import { MMKV } from "react-native-mmkv";

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  if (!isLoadingComplete) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <NavigationContainer
        linking={navigationLinking}
        theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <RootNavigator />
      </NavigationContainer>
      <StatusBar />
    </SafeAreaProvider>
  );
}

export const storage = new MMKV();
