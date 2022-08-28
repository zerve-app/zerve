import React, { useMemo } from "react";

import ScreenHeader from "../components/ScreenHeader";
import {
  useDeleteEntry,
  useRenameEntry,
  useSaveEntry,
} from "@zerve/zoo-client/Mutation";
import { useZStoreSchemas, useZNodeValue } from "@zerve/zoo-client/Query";
import {
  useGlobalNavigation,
  useStoreFileNavigation,
} from "../app/useNavigation";
import { OptionsButton } from "../components/OptionsButton";
import { showToast } from "@zerve/zen/Toast";
import { displayStoreFileName, prepareStoreFileName } from "@zerve/zed";
import { JSONSchemaForm, useActionsSheet } from "@zerve/zen";
import { useTextInputFormModal } from "@zerve/zen/TextInputFormModal";

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
  const { setEntryName, openSchema, leave } = useStoreFileNavigation(
    storePath,
    name,
  );
  const { openRawJSON } = useGlobalNavigation();
  const deleteFile = useDeleteEntry(
    storePath,
    useMemo(
      () => ({
        onSuccess: () => showToast(`${displayStoreFileName(name)} Deleted`),
      }),
      [name],
    ),
  );
  const saveFile = useSaveEntry(storePath);
  const renameFile = useRenameEntry(storePath);
  const renameFilePrompt = useTextInputFormModal<string>((prevName: string) => {
    return {
      inputLabel: "New Entry Name",
      defaultValue: prevName,
      onValue: (inputName: string) => {
        const formattedName = prepareStoreFileName(inputName);
        setEntryName(formattedName);
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
    ],
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
