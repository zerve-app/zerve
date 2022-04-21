import React, { useMemo, useState } from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { IconButton } from "@zerve/ui";
import { useActionsSheet } from "@zerve/ui-native";
import { ConnectionProvider, useZNode } from "@zerve/query";
import { useSavedConnections } from "../app/ConnectionStorage";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { ZNode } from "../components/ZNode";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "ZNode">
>;

export function ZNodePage({
  path,
  connection,
}: {
  path: string[];
  connection: string;
}) {
  const { isLoading, data, refetch, isRefetching } = useZNode(path);
  const { navigate } = useNavigation<NavigationProp>();

  const onOptions = useActionsSheet(() => [
    {
      title: "Refresh",
      icon: "refresh",
      onPress: refetch,
    },
    {
      title: "Raw Type",
      icon: "code",
      onPress: () => {
        navigate("RawValue", {
          title: `${path.join("/")} Type`,
          value: data?.type,
        });
      },
    },
    {
      title: "Raw Value",
      icon: "code",
      onPress: () => {
        navigate("RawValue", {
          title: `${path.join("/")} Value`,
          value: data?.node,
        });
      },
    },
  ]);

  return (
    <>
      <ScreenHeader
        isLoading={isLoading || isRefetching}
        title={path.length ? path.join("/") : "Z Connection API"}
        onLongPress={onOptions}
        corner={
          <IconButton
            altTitle="Options"
            onPress={onOptions}
            icon={(p) => <FontAwesome {...p} name="ellipsis-h" />}
          />
        }
      ></ScreenHeader>
      <ZNode
        path={path}
        connection={connection}
        type={data?.type}
        value={data?.node}
      />
    </>
  );
}

export default function ZNodeScreen({
  navigation,
  route,
}: HomeStackScreenProps<"ZNode">) {
  const { connection, path } = route.params;
  const connections = useSavedConnections();
  if (!connection) throw new Error("null connection");
  const conn = connections.find((conn) => conn.key === connection);
  if (!conn) throw new Error("Connection not found");
  return (
    <ConnectionProvider value={conn}>
      <ScreenContainer scroll>
        <ZNodePage path={path} connection={connection} />
      </ScreenContainer>
    </ConnectionProvider>
  );
}
