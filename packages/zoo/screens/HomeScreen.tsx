import React, { useState, useMemo } from "react";
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
import {
  useSavedConnections,
  useConnectionDisclosedState,
  setConnectionDisclosed,
} from "../app/ConnectionStorage";
import { ZerveLogo } from "../components/ZerveLogo";
import { Connection, ConnectionProvider } from "@zerve/client/Connection";
import { Icon } from "@zerve/zen/Icon";
import ScreenContainer from "../components/ScreenContainer";
import { useActionsSheet } from "@zerve/zen";
import { ZLoadedNode } from "../components/ZNode";
import { useGlobalNavigation } from "../app/useNavigation";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "Home">
>;

function ConnectionSection({ connection }: { connection: Connection }) {
  const [actions, setActions] = useState<ActionButtonDef[]>([]);
  const navigation = useNavigation<NavigationProp>();
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
  const isConnectionDisclosed = useConnectionDisclosedState(connection.key);
  return (
    <DisclosureSection
      defaultIsOpen={isConnectionDisclosed}
      onOpenChange={useMemo(
        () => (isOpen) => setConnectionDisclosed(connection.key, isOpen),
        [connection.key]
      )}
      header={<Label>{connection.name}</Label>}
      right={<>{optionsButton}</>}
    >
      <VStack padded>
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
  const { openHistory } = useGlobalNavigation();
  const connections = useSavedConnections();
  return (
    <ScreenContainer scroll safe>
      <ZerveLogo />
      {connections.map((connection) => {
        return (
          <ConnectionProvider key={connection.key} value={connection}>
            <ConnectionSection connection={connection} />
          </ConnectionProvider>
        );
      })}

      <VStack padded>
        <LinkRowGroup
          links={[
            {
              key: "History",
              title: "Local History",
              icon: "history",
              onPress: () => {
                openHistory();
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
