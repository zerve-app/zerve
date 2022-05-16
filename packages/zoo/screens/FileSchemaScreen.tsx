import React, { useMemo } from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { useActionsSheet } from "@zerve/zen";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import {
  connectionSchemasToZSchema,
  useSaveFileSchema,
  useZStoreSchemas,
  useZNodeValue,
} from "@zerve/query";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { JSONSchemaEditor } from "../components/JSONSchemaEditor";
import { displayStoreFileName, ZSchemaSchema } from "@zerve/core";
import { showToast } from "@zerve/zen/Toast";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "FileSchema">
>;

function FileSchemaPage({
  name,
  storePath,
}: {
  name: string;
  storePath: string[];
}) {
  const { data, isLoading } = useZNodeValue([...storePath, "State", name]);

  const { data: schemaStore } = useZStoreSchemas(storePath);

  const fullSchema = useMemo(() => {
    return connectionSchemasToZSchema(schemaStore);
  }, [schemaStore]);

  const navigation = useNavigation<NavigationProp>();
  const saveSchema = useSaveFileSchema(storePath, schemaStore);

  const openOptions = useActionsSheet(() => [
    {
      key: "RawValue",
      title: "Raw Schema Value",
      icon: "code",
      onPress: () => {
        navigation.navigate("RawValue", {
          title: `${name} Value`,
          value: data?.schema,
        });
      },
    },
  ]);
  return (
    <>
      <ScreenHeader
        title={`${displayStoreFileName(name)} Schema`}
        isLoading={isLoading}
        corner={<OptionsButton onOptions={openOptions} />}
        onLongPress={openOptions}
      />
      {data && !isLoading && (
        <JSONSchemaEditor
          saveLabel="Save Schema"
          value={data?.schema}
          onValue={async (schema) => {
            await saveSchema.mutateAsync({ name, schema });
            showToast("Schema has been updated.");
            navigation.goBack();
          }}
          schema={fullSchema}
        />
      )}
    </>
  );
}
export default function FileSchemaScreen({
  navigation,
  route,
}: HomeStackScreenProps<"FileSchema">) {
  const { connection, name, storePath } = route.params;

  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={connection}>
        <FileSchemaPage name={name} storePath={storePath} />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
