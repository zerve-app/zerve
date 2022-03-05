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
import { useColorScheme } from "@zerve/ui";
import { BottomSheetProvider } from "./BottomSheet";
import { QueryProvider } from "@zerve/query";

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  }
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <BottomSheetProvider>
          <NavigationContainer
            linking={navigationLinking}
            theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <RootNavigator />
          </NavigationContainer>
        </BottomSheetProvider>
      </SafeAreaProvider>
    </QueryProvider>
  );
}
