import React, { useEffect } from "react";
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

export default function App() {
  // const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  // if (!isLoadingComplete) {
  //   return null;
  // }
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
// import React from "react";
// import { NavigationContainer, useNavigation } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { StatusBar } from "expo-status-bar";
// import { Button, StyleSheet, Text, View } from "react-native";
// import { SafeAreaProvider } from "react-native-safe-area-context";

// const RootStack = createNativeStackNavigator<{
//   Doc: {};
//   Settings: {};
//   Home: {};
// }>();

// function OtherScreen({ navigation }) {
//   return (
//     <View style={styles.container}>
//       <Button
//         onPress={() => {
//           navigation.goBack();
//         }}
//         title="Close"
//       />
//     </View>
//   );
// }

// function HomeScreen({ navigation }) {
//   return (
//     <View style={styles.container}>
//       <Button
//         onPress={() => {
//           navigation.navigate("Settings");
//         }}
//         title="Open Settings"
//       />
//       <Button
//         onPress={() => {
//           navigation.navigate("Doc");
//         }}
//         title="Open Doc"
//       />
//     </View>
//   );
// }

// function RootNavigator() {
//   return (
//     <RootStack.Navigator>
//       <RootStack.Screen
//         name="Home"
//         component={HomeScreen}
//         options={{ headerShown: false }}
//       />
//       <RootStack.Screen
//         name="Settings"
//         component={OtherScreen}
//         options={{ presentation: "modal" }}
//       />
//       <RootStack.Screen name="Doc" component={OtherScreen} />
//     </RootStack.Navigator>
//   );
// }

// export default function App() {
//   return (
//     <SafeAreaProvider>
//       <NavigationContainer>
//         <RootNavigator />
//       </NavigationContainer>
//       <StatusBar />
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
