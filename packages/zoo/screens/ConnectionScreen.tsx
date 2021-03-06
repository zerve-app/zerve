import React, { useEffect, useMemo, useState } from "react";

import { ActionButtonDef, LinkRowGroup, Paragraph, VStack } from "@zerve/zen";
import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import {
  ConnectionKeyProvider,
  useSavedConnection,
} from "../app/ConnectionStorage";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import NotFoundScreen from "./NotFoundScreen";
import { ConnectionStatusRow } from "./ConnectionInfoScreen";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { displayStoreFileName } from "@zerve/core";
import { useActionsSheet } from "@zerve/zen";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ZLoadedNode } from "../components/ZLoadedNode";
import { useConnectionProjects } from "@zerve/client/Query";

export function ConnectionProjects({
  onActions,
  storePath,
}: {
  onActions: (actions: ActionButtonDef[]) => void;
  storePath: string[];
}) {
  const connection = useSavedConnection();

  const { navigate } = useNavigation<NavigationProp<HomeStackParamList>>();
  const { data, refetch, isLoading } = useConnectionProjects(storePath);
  const list = useMemo(() => {
    return Object.entries(data?.node || {})
      .filter(([childName]) => {
        return childName !== "$schemas";
      })
      .map(([name, docValue]) => {
        return { key: name, name, ...docValue };
      });
  }, [data]);

  useEffect(() => {
    const actions: ActionButtonDef[] = [];
    if (refetch && !isLoading) {
      actions.push({
        key: "refresh",
        icon: "refresh",
        title: "Refresh",
        onPress: refetch,
      });
    }
    onActions(actions);
  }, [isLoading, refetch]);

  if (!connection) return <Paragraph danger>Connection unavailable.</Paragraph>;
  if (!list?.length) return <Paragraph>No files here.</Paragraph>;

  return (
    <LinkRowGroup
      links={list.map((child) => ({
        key: child.key,
        title: displayStoreFileName(child.name),
        icon: "list-ul",
        onPress: () => {
          navigate("File", {
            connection: connection?.key || null,
            name: child.key,
          });
        },
      }))}
    />
  );
}

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "Connection">
>;

export function ConnectionPage({
  navigation,
  route,
}: HomeStackScreenProps<"Connection">) {
  const conn = useSavedConnection(route.params.connection);
  if (!conn) {
    return <NotFoundScreen />;
  }
  const { navigate } = useNavigation<NavigationProp>();
  const [optionsButton] = useActionsSheet(
    (onOpen) => <OptionsButton onOptions={onOpen} />,
    () => [
      {
        key: "info",
        title: "Connection Info",
        icon: "link",
        onPress: () => {
          navigate("SettingsStack", {
            screen: "ConnectionInfo",
            params: { connection: conn.key },
          });
        },
      },
      {
        key: "api",
        title: "API",
        icon: "code",
        onPress: () => {
          navigate("ZNode", {
            connection: conn.key,
            path: [],
          });
        },
      },
    ]
  );
  return (
    <>
      <ScreenHeader title={`Connection: ${conn.name}`} corner={optionsButton} />
      <VStack padded>
        <ConnectionStatusRow />
        <ZLoadedNode path={[]} />
      </VStack>
    </>
  );
}

export default function ConnectionScreen({
  navigation,
  route,
}: HomeStackScreenProps<"Connection">) {
  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={route.params.connection}>
        <ConnectionPage route={route} navigation={navigation} />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
