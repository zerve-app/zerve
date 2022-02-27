import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Button, HStack, PageSection, PageTitle } from "@zerve/ui";

import { Text, View } from "@zerve/ui/Themed";
import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
  RootStackScreenProps,
} from "../navigation/Links";
import { useBlueGreen } from "@zerve/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppPage from "../components/AppPage";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

function ConnectionsSection() {
  const navigation = useNavigation();
  return (
    <PageSection title="Connections">
      <Button
        onPress={() => {
          navigation.navigate("NewConnection");
        }}
        title="New Connection"
      />
    </PageSection>
  );
}

export default function HomeScreen() {
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        NativeStackNavigationProp<RootStackParamList, "HomeStack">,
        NativeStackNavigationProp<HomeStackParamList, "Home">
      >
    >();
  const [color, onToggle] = useBlueGreen();
  return (
    <AppPage>
      <PageTitle title="Zerve Home" />
      <ConnectionsSection />
      <HStack>
        <Button
          onPress={() => {
            navigation.navigate("SettingsStack");
          }}
          title="Open Settings"
        />
        <Button
          onPress={() => {
            navigation.navigate("Doc", { name: "LOL" });
          }}
          title="Go to Doc"
        />
      </HStack>
    </AppPage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
