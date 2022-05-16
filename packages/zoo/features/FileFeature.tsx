import React, { useMemo } from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import {
  useDeleteFile,
  useRenameFile,
  useSaveFile,
  useZStoreSchemas,
  useZNodeValue,
} from "@zerve/query";
import { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "../app/useNavigation";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { showToast } from "@zerve/zen/Toast";
import { JSONSchemaEditor } from "../components/JSONSchemaEditor";
import { displayStoreFileName, prepareStoreFileName } from "@zerve/core";
import { useStringInput } from "../components/StringInput";
import { useActionsSheet } from "@zerve/zen";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "File">
>;

export function FileFeature({
  name,
  connection,
  storePath,
}: {
  name: string;
  connection: string | null;
  storePath: string[];
}) {
  console.log({
    name,
    connection,
    storePath,
  });
  const { data: schemaStore, isLoading: isSchemasLoading } =
    useZStoreSchemas(storePath);
  const {
    data,
    isLoading: isNodeLoading,
    refetch,
  } = useZNodeValue([...storePath, "State", name]);
  const isLoading = isSchemasLoading || isNodeLoading;
  const navigation = useNavigation<NavigationProp>();
  const deleteFile = useDeleteFile(
    storePath,
    useMemo(
      () => ({
        onSuccess: () => showToast(`${displayStoreFileName(name)} Deleted`),
      }),
      [name]
    )
  );
  const saveFile = useSaveFile(storePath);
  const renameFile = useRenameFile(storePath);
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
          storePath,
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
