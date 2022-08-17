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
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { useActionsSheet } from "@zerve/zen";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ZLoadedNode } from "../components/ZNode";

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
    ],
  );
  return (
    <>
      <ScreenHeader title={`Connection: ${conn.name}`} corner={optionsButton} />
      <VStack padded>
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
