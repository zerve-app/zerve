import React from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { Button, Icon, LinkRowGroup, showToast, VStack } from "@zerve/ui";
import { useActionsSheet } from "@zerve/ui-native";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import {
  QueryConnectionProvider,
  useDeleteSchema,
  useSaveSchema,
  useZConnectionJSONSchema,
  useZNodeValue,
} from "@zerve/query";
import { useConnection } from "../app/Connection";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { displayStoreFileName, ZSchemaSchema } from "@zerve/core";
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
  const {
    data: fullSchema,
    isError,
    isLoading: isSLoading,
  } = useZConnectionJSONSchema();
  const saveSchema = useSaveSchema();
  const deleteSchema = useDeleteSchema();
  const { goBack, navigate } = useNavigation();
  const openOptions = useActionsSheet(() => [
    {
      key: "RawValue",
      title: "Raw Schema Value",
      icon: "code",
      onPress: () => {
        navigate("RawValue", {
          title: `${schema} Value`,
          value: data,
        });
      },
    },
    {
      key: "Delete",
      title: "Delete Schema",
      icon: "trash",
      danger: true,
      onPress: () => {
        deleteSchema.mutate({ schemaName: schema });
        goBack();
      },
    },
  ]);
  return (
    <VStack>
      <ScreenHeader
        title={`${displayStoreFileName(schema)} Schema`}
        isLoading={isLoading}
        corner={<OptionsButton onOptions={openOptions} />}
        onLongPress={openOptions}
      />
      <JSONSchemaEditor
        onValue={async (v) => {
          await saveSchema.mutateAsync({ schemaName: schema, schema: v });
          showToast("Schema has been updated.");
          goBack();
        }}
        saveLabel="Save Schema"
        value={data}
        schema={fullSchema}
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
