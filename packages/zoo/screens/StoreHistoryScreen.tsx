import React from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { useActionsSheet } from "@zerve/zen";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { useZNodeValue } from "@zerve/query";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import { CompositeNavigationProp } from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "StoreHistory">
>;

function StoreHistoryPage({
  connection,
  storePath,
}: {
  connection: string | null;
  storePath: string[];
}) {
  const { data, isLoading } = useZNodeValue([...storePath, "State"]);
  const [optionsButton, openOptions] = useActionsSheet(
    (onOpen) => <OptionsButton onOptions={onOpen} />,
    () => []
  );
  return (
    <>
      <ScreenHeader
        title={"Chain History"}
        isLoading={isLoading}
        corner={optionsButton}
        onLongPress={openOptions}
      />
    </>
  );
}

export default function StoreHistoryScreen({
  navigation,
  route,
}: HomeStackScreenProps<"StoreHistory">) {
  const { connection, storePath } = route.params;

  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={connection}>
        <StoreHistoryPage connection={connection} storePath={storePath} />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
