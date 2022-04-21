import React, { useState } from "react";
import {
  Button,
  DisclosureSection,
  HStack,
  IconButton,
  Label,
  VStack,
  LinkRowGroup,
  ActionButtonDef,
  ThemedText,
} from "@zerve/ui";
import { HomeStackParamList, RootStackParamList } from "../app/Links";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  useConnectionStatus,
  useSavedConnections,
} from "../app/ConnectionStorage";
import { FontAwesome } from "@expo/vector-icons";
import { ZerveLogo } from "../components/ZerveLogo";
import { useDocs } from "@zerve/native";
import { ConnectionProvider, SavedConnection } from "@zerve/query";
import { Icon } from "@zerve/ui/Icon";
import { getDocumentAsync } from "expo-document-picker";
import ScreenContainer from "../components/ScreenContainer";
import { useActionsSheet } from "@zerve/ui-native";
import { ZLoadedNode } from "../components/ZNode";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "Home">
>;

function ConnectionSection({ connection }: { connection: SavedConnection }) {
  const [actions, setActions] = useState<ActionButtonDef[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const { isConnected } = useConnectionStatus();
  const onOptions = useActionsSheet(() => [
    ...actions,
    {
      key: "open",
      title: `Open ${connection.name}`,
      icon: "server",
      onPress: () => {
        navigation.navigate("Connection", {
          connection: connection.key,
        });
      },
    },
    {
      title: "Connection Info",
      key: "connInfo",
      icon: "link",
      onPress: () => {
        navigation.navigate("SettingsStack", {
          screen: "ConnectionInfo",
          params: { connection: connection.key },
        });
      },
    },
  ]);
  return (
    <DisclosureSection
      header={<Label>{connection.name}</Label>}
      right={
        <>
          <IconButton
            altTitle="Options"
            onPress={onOptions}
            icon={(p) => <Icon name="ellipsis-h" {...p} />}
          />
          <ThemedText>{isConnected ? "🟢" : "🔴"}</ThemedText>
        </>
      }
    >
      <VStack>
        <ZLoadedNode path={[]} />
      </VStack>
    </DisclosureSection>
  );
}

export default function HomeScreen({
  navigation,
}: {
  navigation: NavigationProp;
}) {
  const connections = useSavedConnections();
  return (
    <ScreenContainer scroll safe>
      <ZerveLogo />
      {connections.map((connection) => (
        <ConnectionProvider key={connection.key} value={connection}>
          <ConnectionSection connection={connection} />
        </ConnectionProvider>
      ))}
      {/* <LocalDocsSection /> */}
      <VStack>
        <LinkRowGroup
          links={[
            {
              key: "History",
              title: "Local History",
              icon: "history",
              onPress: () => {
                navigation.navigate("History");
              },
            },
            {
              title: "Server Connections",
              key: "serverConnections",
              icon: "link",
              onPress: () => {
                navigation.navigate("SettingsStack", {
                  screen: "Connections",
                });
              },
            },
            {
              key: "AppSettings",
              title: "App Settings",
              icon: "gear",
              onPress: () => {
                navigation.navigate("SettingsStack", {
                  screen: "Settings",
                });
              },
            },
          ]}
        />
      </VStack>
    </ScreenContainer>
  );
}
