import React from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { useActionsSheet } from "@zerve/ui-native";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { QueryConnectionProvider, useZNodeValue } from "@zerve/query";
import { useConnection } from "../app/Connection";
import { CompositeNavigationProp } from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "ChainHistory">
>;

function ChainHistoryPage({ connection }: { connection: string | null }) {
  const { data, isLoading } = useZNodeValue(["Store", "State"]);
  const openOptions = useActionsSheet(() => []);
  return (
    <>
      <ScreenHeader
        title={"Chain History"}
        isLoading={isLoading}
        corner={<OptionsButton onOptions={openOptions} />}
        onLongPress={openOptions}
      />
    </>
  );
}

export default function ChainHistoryScreen({
  navigation,
  route,
}: HomeStackScreenProps<"ChainHistory">) {
  const { connection } = route.params;

  return (
    <ScreenContainer scroll>
      <QueryConnectionProvider value={useConnection(connection)}>
        <ChainHistoryPage connection={connection} />
      </QueryConnectionProvider>
    </ScreenContainer>
  );
}
