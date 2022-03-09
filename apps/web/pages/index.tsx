import Head from "next/head";
import { Text, View } from "react-native";
import { Button } from "@zerve/ui";

export default function Web() {
  return (
    <View style={{ backgroundColor: "lightblue", flex: 1 }}>
      <Head>
        <title>Zerve App</title>
      </Head>
      <Text>Zerve</Text>
      {/* @ts-ignore */}
      <Text style={{}} accessibilityRole="link" href={`/display`}>
        Display
      </Text>
      {/* @ts-ignore */}
      <Text style={{}} accessibilityRole="link" href={`/control`}>
        Control Panel
      </Text>
    </View>
  );
}
