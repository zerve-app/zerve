import React from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { showToast, VStack } from "@zerve/zen";
import { useActionsSheet } from "@zerve/zen";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import {
  useDeleteSchema,
  useSaveSchema,
  useZStoreJSONSchema,
  useZNodeValue,
} from "@zerve/query";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { displayStoreFileName } from "@zerve/core";
import { JSONSchemaEditor } from "../components/JSONSchemaEditor";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "ChainSchema">
>;

function ChainSchemasPage({
  connection,
  schema,
  storePath,
}: {
  connection: string | null;
  schema: string;
  storePath: string[];
}) {
  const { data, isLoading } = useZNodeValue([
    ...storePath,
    "State",
    "$schemas",
    schema,
  ]);
  const {
    data: fullSchema,
    isError,
    isLoading: isSLoading,
  } = useZStoreJSONSchema(storePath);
  const saveSchema = useSaveSchema(storePath);
  const deleteSchema = useDeleteSchema(storePath);
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
  const { connection, schema, storePath } = route.params;

  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={connection}>
        <ChainSchemasPage
          connection={connection}
          schema={schema}
          storePath={storePath}
        />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
