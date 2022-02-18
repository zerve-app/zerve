import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "@zerve/ui";

import { View } from "../components/Themed";
import { RootStackScreenProps } from "../navigation/Links";

export default function HomeScreen({
  navigation,
}: RootStackScreenProps<"Home">) {
  return (
    <View style={styles.container}>
      <Button
        onPress={() => {
          navigation.navigate("Settings");
        }}
        title="Open Settings"
      />

      <Button
        onPress={() => {
          navigation.navigate("Doc", { name: "LOL" });
        }}
        title="Go to Doc"
      />
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
