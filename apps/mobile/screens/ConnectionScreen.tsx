import React, { useEffect, useState } from "react";

import {
  ActionButtonDef,
  LinkRowGroup,
  Paragraph,
  VStack,
  LinkRow,
} from "@zerve/ui";
import {
  HomeStackParamList,
  HomeStackScreenProps,
  SettingsStackScreenProps,
} from "../app/Links";
import {
  Connection,
  destroyConnection,
  useConnection,
} from "../app/Connection";
import { FontAwesome } from "@expo/vector-icons";
import { InfoRow } from "@zerve/ui/Row";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import NotFoundScreen from "./NotFoundScreen";
import { ConnectionStatusRow } from "./ConnectionInfoScreen";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { getZIcon } from "../app/ZIcon";
import { useConnectionContext, useConnectionProjects } from "@zerve/query";

export function ConnectionProjects({
  onActions,
  connection,
}: {
  onActions: (actions: ActionButtonDef[]) => void;
  connection: Connection;
}) {
  const { navigate } = useNavigation<NavigationProp<HomeStackParamList>>();
  const { data, refetch, isLoading } = useConnectionProjects();
  const list = data?.docs?.children;

  useEffect(() => {
    const actions: ActionButtonDef[] = [];
    if (refetch && !isLoading) {
      actions.push({
        key: "reload",
        title: "Reload",
        onPress: refetch,
      });
    }
    onActions(actions);
  }, [isLoading, refetch]);

  if (!connection) return <Paragraph danger>Connection unavailable.</Paragraph>;
  if (!list?.length) return <Paragraph>No Projects here.</Paragraph>;

  return (
    <LinkRowGroup
      links={data?.docs?.children?.map((childKey: string) => ({
        key: childKey,
        title: childKey,
        icon: getZIcon("Container"),
        onPress: () => {
          navigate("ZNode", {
            connection: connection.key,
            path: [childKey],
          });
        },
      }))}
    />
  );
}

export function ConnectionMetaLinks({
  connection,
}: {
  connection: Connection;
}) {
  const { navigate } = useNavigation<NavigationProp<HomeStackParamList>>();
  return (
    <LinkRowGroup
      links={[
        {
          key: "Events",
          title: "Event History",
          icon: "history",
          onPress: () => {
            navigate("ZNode", {
              connection: connection.key,
              path: [],
            });
          },
        },
        {
          key: "ServerTypes",
          title: "Types",
          icon: "crosshairs",
          onPress: () => {
            navigate("ZNode", {
              connection: connection.key,
              path: [],
            });
          },
        },
        {
          key: "ServerAPI",
          title: "Server Setup",
          icon: "database",
          onPress: () => {
            navigate("ZNode", {
              connection: connection.key,
              path: [],
            });
          },
        },
      ]}
    />
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
      <ScreenHeader title={`Connection: ${conn?.name}`} />
      <VStack>
        <ConnectionStatusRow connection={conn} />
        <ConnectionProjects connection={conn} onActions={() => {}} />
        <ConnectionMetaLinks connection={conn} />
      </VStack>
    </ScreenContainer>
  );
}
