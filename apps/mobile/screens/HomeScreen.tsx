import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import {
  Button,
  HStack,
  PageSection,
  PageTitle,
  useColors,
  VStack,
} from "@zerve/ui";

import { Text, View } from "@zerve/ui/Themed";
import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
  RootStackScreenProps,
} from "../navigation/Links";
import { useBlueGreen, useStorage } from "@zerve/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppPage from "../components/AppPage";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useConnections } from "../components/Connection";
import { FontAwesome } from "@expo/vector-icons";

function SettingsButton({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  return (
    <Button
      left={<FontAwesome name="gear" size={24} color={colors.text} />}
      title="Settings"
      onPress={onPress}
    />
  );
}

function LocalDocsSection({}: {}) {
  return (
    <PageSection title="Local Documents">
      <VStack>
        <Button onPress={() => {}} title="New Document" />
        <Button onPress={() => {}} title="Add Files" />
      </VStack>
    </PageSection>
  );
}

function ConnectionsSection({
  onNewConnection,
  onOpenConnection,
}: {
  onNewConnection: () => void;
  onOpenConnection: (key: string) => void;
}) {
  const connections = useConnections();
  return (
    <PageSection title="Server Connections">
      <VStack>
        {connections.map((connection) => (
          <Button
            key={connection.key}
            title={connection.name}
            onPress={() => {
              onOpenConnection(connection.key);
            }}
          />
        ))}
        <Button
          onPress={() => {
            onNewConnection();
          }}
          title="New Connection"
        />
      </VStack>
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
  return (
    <AppPage>
      <PageTitle title="Zerve Home" />
      <LocalDocsSection />
      <ConnectionsSection
        onNewConnection={() => {
          navigation.navigate("NewConnection");
        }}
        onOpenConnection={(connection) => {
          navigation.navigate("Connection", { connection });
        }}
      />
      <HStack>
        <SettingsButton
          onPress={() => {
            navigation.navigate("SettingsStack");
          }}
          title="Settings"
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
