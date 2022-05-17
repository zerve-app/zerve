import React, { useState } from "react";
import {
  DisclosureSection,
  IconButton,
  Label,
  VStack,
  LinkRowGroup,
  ActionButtonDef,
  ThemedText,
} from "@zerve/zen";
import { HomeStackParamList, RootStackParamList } from "../app/Links";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSavedConnections } from "../app/ConnectionStorage";
import { ZerveLogo } from "../components/ZerveLogo";
import {
  ConnectionProvider,
  SavedConnection,
  SavedConnectionProvider,
} from "@zerve/query";
import { Icon } from "@zerve/zen/Icon";
import ScreenContainer from "../components/ScreenContainer";
import { useActionsSheet } from "@zerve/zen";
import { ZLoadedNode } from "../components/ZLoadedNode";
import { useConnectionStatus } from "../app/ConnectionStatus";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "Home">
>;

function ConnectionSection({ connection }: { connection: SavedConnection }) {
  const [actions, setActions] = useState<ActionButtonDef[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const { isConnected } = useConnectionStatus();
  const [optionsButton] = useActionsSheet(
    (onOpen) => (
      <IconButton
        altTitle="Options"
        onPress={onOpen}
        icon={(p) => <Icon name="ellipsis-h" {...p} />}
      />
    ),
    () => [
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
    ]
  );
  return (
    <DisclosureSection
      header={<Label>{connection.name}</Label>}
      right={
        <>
          {optionsButton}
          <ThemedText>{isConnected ? "🟢" : "🔴"}</ThemedText>
        </>
      }
    >
      <VStack>
        <ZLoadedNode path={[]} onActions={setActions} />
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
      {connections.map((connection) => {
        return (
          <SavedConnectionProvider key={connection.key} value={connection}>
            <ConnectionSection connection={connection} />
          </SavedConnectionProvider>
        );
      })}
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
