import React from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { Button, Icon, LinkRowGroup, VStack } from "@zerve/ui";
import { useActionsSheet } from "@zerve/ui-native";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import {
  QueryConnectionProvider,
  useSaveSchema,
  useZNodeValue,
} from "@zerve/query";
import { useConnection } from "../app/Connection";
import { CompositeNavigationProp } from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { ZSchemaSchema } from "@zerve/core";
import { JSONSchemaEditor } from "../components/JSONSchemaEditor";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "ChainSchema">
>;

function ChainSchemasPage({
  connection,
  schema,
}: {
  connection: string | null;
  schema: string;
}) {
  const { data, isLoading } = useZNodeValue([
    "Store",
    "State",
    "$schemas",
    schema,
  ]);
  const saveSchema = useSaveSchema();
  const openOptions = useActionsSheet(() => []);
  return (
    <VStack>
      <ScreenHeader
        title={`${schema} Schema`}
        isLoading={isLoading}
        corner={<OptionsButton onOptions={openOptions} />}
        onLongPress={openOptions}
      />
      <JSONSchemaEditor
        onValue={async (v) => {
          saveSchema.mutate({ schemaName: schema, schema: v });
        }}
        saveLabel="Save Schema"
        value={data}
        schema={ZSchemaSchema}
      />
    </VStack>
  );
}

export default function ChainSchemaScreen({
  navigation,
  route,
}: HomeStackScreenProps<"ChainSchema">) {
  const { connection, schema } = route.params;

  return (
    <ScreenContainer scroll>
      <QueryConnectionProvider value={useConnection(connection)}>
        <ChainSchemasPage connection={connection} schema={schema} />
      </QueryConnectionProvider>
    </ScreenContainer>
  );
}
