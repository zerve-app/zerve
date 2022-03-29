import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";

import useCachedResources from "./useCachedResources";
import { navigationLinking } from "./Links";
import RootNavigator from "./RootNavigator";
import { BottomSheetProvider, useColorScheme } from "@zerve/ui";
import { QueryProvider } from "@zerve/query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastContainer } from "./Toast";

import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <BottomSheetProvider>
          <SafeAreaProvider>
            <NavigationContainer
              linking={navigationLinking}
              theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </BottomSheetProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
