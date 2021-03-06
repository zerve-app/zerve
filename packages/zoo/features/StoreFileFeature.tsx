import React, { useMemo } from "react";

import { HomeStackParamList, RootStackParamList } from "../app/Links";
import ScreenHeader from "../components/ScreenHeader";
import {
  useDeleteFile,
  useRenameFile,
  useSaveFile,
} from "@zerve/client/Mutation";
import { useZStoreSchemas, useZNodeValue } from "@zerve/client/Query";
import {
  useGlobalNavigation,
  useStoreFileNavigation,
} from "../app/useNavigation";
import { OptionsButton } from "../components/OptionsButton";
import { showToast } from "@zerve/zen/Toast";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { displayStoreFileName, prepareStoreFileName } from "@zerve/core";
import { useActionsSheet } from "@zerve/zen";
import { useTextInputFormModal } from "../components/TextInputFormModal";

export function FileFeature({
  name,
  storePath,
}: {
  name: string;
  storePath: string[];
}) {
  const { data: schemaStore, isLoading: isSchemasLoading } =
    useZStoreSchemas(storePath);
  const {
    data,
    isLoading: isNodeLoading,
    refetch,
  } = useZNodeValue([...storePath, "State", name]);
  const isLoading = isSchemasLoading || isNodeLoading;
  const { setFileName, openSchema, leave } = useStoreFileNavigation(
    storePath,
    name
  );
  const { openRawJSON } = useGlobalNavigation();
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
  const renameFilePrompt = useTextInputFormModal<string>((prevName: string) => {
    return {
      inputLabel: "New File Name",
      defaultValue: prevName,
      onValue: (inputName: string) => {
        const formattedName = prepareStoreFileName(inputName);
        setFileName(formattedName);
        renameFile.mutate({ prevName: name, newName: formattedName });
      },
    };
  });
  const [optionsButton, openOptions] = useActionsSheet(
    (onOpen) => <OptionsButton onOptions={onOpen} />,
    () => [
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
          openSchema();
        },
      },
      {
        key: "RawValue",
        title: "Raw Value",
        icon: "code",
        onPress: () => {
          openRawJSON(`${displayStoreFileName(name)} Value`, data?.value);
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
        onHandled: leave,
      },
    ]
  );
  return (
    <>
      <ScreenHeader
        title={displayStoreFileName(name)}
        isLoading={isLoading}
        corner={optionsButton}
        onLongPress={openOptions}
        onBack={leave}
      />
      {data && (
        <JSONSchemaForm
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
