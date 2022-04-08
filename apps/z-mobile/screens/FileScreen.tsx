import React from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { useActionsSheet } from "@zerve/ui-native";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import {
  QueryConnectionProvider,
  useDeleteFile,
  useRenameFile,
  useSaveFile,
  useZConnectionSchemas,
  useZNodeValue,
} from "@zerve/query";
import { useConnection } from "../app/Connection";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { showToast } from "@zerve/ui/Toast";
import { JSONSchemaEditor } from "../components/JSONSchemaEditor";
import { displayStoreFileName, prepareStoreFileName } from "@zerve/core";
import { useStringInput } from "../components/StringInput";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "File">
>;

function FilePage({
  name,
  connection,
}: {
  name: string;
  connection: string | null;
}) {
  const { data: schemaStore, isLoading: isSchemasLoading } =
    useZConnectionSchemas();
  const {
    data,
    isLoading: isNodeLoading,
    refetch,
  } = useZNodeValue(["Store", "State", name]);
  const isLoading = isSchemasLoading || isNodeLoading;
  const navigation = useNavigation<NavigationProp>();
  const deleteFile = useDeleteFile();
  const saveFile = useSaveFile();
  const renameFile = useRenameFile();
  const renameFilePrompt = useStringInput<string>((prevName: string) => {
    return {
      inputLabel: "New File Name",
      defaultValue: prevName,
      onValue: (inputName: string) => {
        const formattedName = prepareStoreFileName(inputName);
        navigation.setParams({ name: formattedName });
        renameFile.mutate({ prevName: name, newName: formattedName });
      },
    };
  });
  const openOptions = useActionsSheet(() => [
    {
      key: "Refresh",
      title: "Refresh",
      icon: "refresh",
      onPress: () => {
        refetch();
      },
    },
    {
      key: "EditSchema",
      title: "Edit Schema",
      icon: "crosshairs",
      onPress: () => {
        navigation.navigate("FileSchema", {
          name,
          connection,
        });
      },
    },
    {
      key: "RawValue",
      title: "Raw Value",
      icon: "code",
      onPress: () => {
        navigation.navigate("RawValue", {
          title: `${displayStoreFileName(name)} Value`,
          value: data?.value,
        });
      },
    },
    {
      key: "Rename",
      title: "Rename File",
      icon: "edit",
      onPress: () => {
        renameFilePrompt(displayStoreFileName(name));
      },
    },
    {
      key: "DeleteFile",
      title: "Delete File",
      icon: "trash",
      danger: true,
      onPress: () => {
        deleteFile.mutate(name);
      },
      onHandled: navigation.goBack,
    },
  ]);
  return (
    <>
      <ScreenHeader
        title={displayStoreFileName(name)}
        isLoading={isLoading}
        corner={<OptionsButton onOptions={openOptions} />}
        onLongPress={openOptions}
      />
      {data && (
        <JSONSchemaEditor
          onValue={async (value) => {
            await saveFile.mutateAsync({ name, value });
            showToast("File has been updated.");
          }}
          value={data.value}
          schema={data.schema}
          schemaStore={schemaStore}
        />
      )}
    </>
  );
}
export default function FileScreen({
  navigation,
  route,
}: HomeStackScreenProps<"File">) {
  const { connection, name } = route.params;

  return (
    <ScreenContainer scroll>
      <QueryConnectionProvider value={useConnection(connection)}>
        <FilePage name={name} connection={connection} />
      </QueryConnectionProvider>
    </ScreenContainer>
  );
}
