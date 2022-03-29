import React from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { useActionsSheet } from "@zerve/ui";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import {
  QueryConnectionProvider,
  useSaveFileSchema,
  useZNodeValue,
} from "@zerve/query";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { useConnection } from "../app/Connection";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FileEditor } from "../components/FileEditor";
import { displayStoreFileName, ZSchemaSchema } from "@zerve/core";
import { showToast } from "../app/Toast";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "FileSchema">
>;

function FileSchemaPage({ name }: { name: string }) {
  const { data, isLoading } = useZNodeValue(["Store", "State", name]);
  const navigation = useNavigation<NavigationProp>();
  const saveSchema = useSaveFileSchema();
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
        <FileEditor
          saveLabel="Save Schema"
          value={data?.schema}
          onValue={async (schema) => {
            await saveSchema.mutateAsync({ name, schema });
            showToast("Schema has been updated.");
            navigation.goBack();
          }}
          schema={ZSchemaSchema}
        />
      )}
    </>
  );
}
export default function FileSchemaScreen({
  navigation,
  route,
}: HomeStackScreenProps<"FileSchema">) {
  const { connection, name } = route.params;

  return (
    <ScreenContainer scroll>
      <QueryConnectionProvider value={useConnection(connection)}>
        <FileSchemaPage name={name} />
      </QueryConnectionProvider>
    </ScreenContainer>
  );
}
