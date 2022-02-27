import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";

import useCachedResources from "./hooks/useCachedResources";
import { navigationLinking } from "./navigation/Links";
import RootNavigator from "./navigation/RootNavigator";
import { useColorScheme } from "@zerve/ui";

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
    </SafeAreaProvider>
  );
}
