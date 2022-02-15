import { StyleSheet } from "react-native";
import React from "react";

import { Text, View } from "../components/Themed";
import { Button } from "ui";
import { RootStackScreenProps } from "../navigation/Links";

export default function DocScreen({
  navigation,
  route,
}: RootStackScreenProps<"Doc">) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Doc: {route.params.name}</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Button
        onPress={() => {
          navigation.goBack();
        }}
        title="Go to Block"
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
