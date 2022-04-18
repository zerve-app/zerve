import React, { useEffect, useMemo, useState } from "react";

import {
  ActionButtonDef,
  LinkRowGroup,
  Paragraph,
  VStack,
  Button,
  HStack,
} from "@zerve/ui";
import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { ConnectionDefinition, useConnection } from "../app/Connection";
import { FontAwesome } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import NotFoundScreen from "./NotFoundScreen";
import { ConnectionStatusRow } from "./ConnectionInfoScreen";
import {
  CompositeNavigationProp,
  NavigationProp,
  useNavigation,
} from "@react-navigation/native";
import {
  QueryConnectionProvider,
  useQueryContext,
  useConnectionProjects,
  useConnectionRootType,
  useConnectionStatus,
} from "@zerve/query";
import { View } from "react-native";
import { displayStoreFileName } from "@zerve/core";
import { useActionsSheet } from "@zerve/ui-native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const TempConstStorePath = ["Store"];

export function ConnectionHome({
  onActions,
}: {
  onActions: (actions: ActionButtonDef[]) => void;
}) {
  const connection = useQueryContext();
  const { isConnected } = useConnectionStatus();
  const { navigate } =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const connectionRootType = useConnectionRootType();
  if (isConnected && connectionRootType?.data?.children?.Store) {
    return (
      <>
        <ConnectionProjects
          onActions={onActions}
          storePath={TempConstStorePath}
        />
        <HStack>
          <NewFileButton />
        </HStack>
        <LinkRowGroup
          links={[
            {
              key: "Events",
              title: "Event History",
              icon: "history",
              onPress: () => {
                navigate("ChainHistory", {
                  connection: connection && connection.key,
                  storePath: TempConstStorePath,
                });
              },
            },
            {
              key: "ServerSchemas",
              title: "Schemas",
              icon: "crosshairs",
              onPress: () => {
                navigate("ChainSchemas", {
                  connection: connection && connection.key,
                  storePath: TempConstStorePath,
                });
              },
            },
          ]}
        />
      </>
    );
  }
  return null;
}

export function ConnectionProjects({
  onActions,
  storePath,
}: {
  onActions: (actions: ActionButtonDef[]) => void;
  storePath: string[];
}) {
  const connection = useQueryContext();

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

export function NewFileButton() {
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
  const conn = useQueryContext();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 12,
      }}
    >
      <Button
        onPress={() => {
          navigation.navigate("NewFile", { connection: conn?.key || null });
        }}
        small
        title="New File"
        left={({ color }) => (
          <FontAwesome name="plus-circle" color={color} size={24} />
        )}
      />
    </View>
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
  const conn = useConnection(route.params.connection);
  if (!conn) {
    return <NotFoundScreen />;
  }
  const { navigate } = useNavigation<NavigationProp>();
  const openOptions = useActionsSheet(() => [
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
  ]);
  return (
    <ScreenContainer scroll>
      <ScreenHeader
        title={`Connection: ${conn?.name}`}
        corner={<OptionsButton onOptions={openOptions} />}
      />
      <VStack>
        <ConnectionStatusRow connection={conn} />
        <ConnectionHome onActions={() => {}} />
      </VStack>
    </ScreenContainer>
  );
}

export default function ConnectionScreen({
  navigation,
  route,
}: HomeStackScreenProps<"Connection">) {
  const conn = useConnection(route.params.connection);
  if (!conn) {
    return <NotFoundScreen />;
  }
  return (
    <ScreenContainer scroll>
      <QueryConnectionProvider value={conn}>
        <ConnectionPage route={route} navigation={navigation} />
      </QueryConnectionProvider>
    </ScreenContainer>
  );
}
