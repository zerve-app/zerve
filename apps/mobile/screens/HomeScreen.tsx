import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Button } from "@zerve/ui";

import { Text, View } from "../components/Themed";
import { RootStackScreenProps } from "../navigation/Links";
import { storage, useBlueGreen, useDocList } from "../components/Storage";

export default function HomeScreen({
  navigation,
}: RootStackScreenProps<"Home">) {
  const [blueGreen, toggleBlueGreen] = useBlueGreen();
  return (
    <View style={styles.container}>
      <Text style={{ color: blueGreen }}>
        I am {blueGreen}, even after restart
      </Text>
      <Button onPress={toggleBlueGreen} title="Toggle Title Color" />
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
