import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";
import React from "react";

import { View } from "../components/Themed";
import { Button } from "@zerve/ui";
import { RootStackScreenProps } from "../navigation/Links";

export default function SettingsScreen({
  navigation,
}: RootStackScreenProps<"Settings">) {
  // const { goBack } = useNavigation();
  return (
    <View style={styles.container}>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Button
        onPress={() => {
          navigation.goBack();
        }}
        title="Close Settings"
      />
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
