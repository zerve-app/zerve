import React from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { Button } from "@zerve/ui";
import { useActionsSheet } from "@zerve/ui-native";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { QueryConnectionProvider, useZNodeValue } from "@zerve/query";
import { useConnection } from "../app/Connection";
import { CompositeNavigationProp } from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useStringInput } from "../components/StringInput";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "ChainSchemas">
>;

function ChainSchemasPage({ connection }: { connection: string | null }) {
  const { data, isLoading } = useZNodeValue(["Store", "State"]);
  const openOptions = useActionsSheet(() => []);
  const onOpenNewSchema = useStringInput<void>(() => ({
    onValue: (propertyName) => {},
    defaultValue: "",
    inputLabel: "New Schema",
  }));
  return (
    <>
      <ScreenHeader
        title={"Schemas"}
        isLoading={isLoading}
        corner={<OptionsButton onOptions={openOptions} />}
        onLongPress={openOptions}
      />
      <Button title="Create Schema" onPress={() => onOpenNewSchema()} />
    </>
  );
}

export default function ChainSchemasScreen({
  navigation,
  route,
}: HomeStackScreenProps<"ChainSchemas">) {
  const { connection } = route.params;

  return (
    <ScreenContainer scroll>
      <QueryConnectionProvider value={useConnection(connection)}>
        <ChainSchemasPage connection={connection} />
      </QueryConnectionProvider>
    </ScreenContainer>
  );
}
