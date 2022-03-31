import Head from "next/head";
import { Text, View } from "react-native";
import { Button, HStack, ThemedText } from "@zerve/ui";

export default function Web() {
  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <Head>
        <title>Zerve App</title>
      </Head>
      {/* <HStack>
        <Button title="oh ok" onPress={() => {}} />
        <Button title="oh ok" onPress={() => {}} />
      </HStack>
      <ThemedText>Zerve</ThemedText> */}
    </View>
  );
}
