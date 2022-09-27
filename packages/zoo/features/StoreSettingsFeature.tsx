import { Dialog } from "@zerve/zen/Dialog";
import { memo } from "react";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import { useMutation, useQueryClient } from "react-query";
import { useRequiredConnection } from "@zerve/zoo-client/Connection";
import { postZAction } from "@zerve/zoo-client/ServerCalls";
import {
  AllExperimentalSchemas,
  IDSchema,
  StoreSettings as StoreSettingsType,
} from "@zerve/zed";
import { useZNodeValue } from "@zerve/zoo-client/Query";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { HStack, VStack } from "@zerve/zen/Stack";
import { Label } from "@zerve/zen/Label";
import { SwitchInput } from "@zerve/zen/Input";
import { Title } from "@zerve/zen/Text";
import { Button } from "@zerve/zen/Button";
import { useModal } from "@zerve/zen/Modal";

function RenameStoreDialog({
  onClose,
  storePath,
  onStoreRename,
}: {
  onClose: () => void;
  storePath: string[];
  onStoreRename: (name: string) => void;
}) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const parentPath = storePath.slice(0, -2); // trim off 'Stores/${storeId}' from storePath
  const storeId = storePath.at(-1);
  const moveStore = useMutation(
    async (newStoreId: string) => {
      await postZAction(conn, [...parentPath, "moveStore"], {
        from: storeId,
        to: newStoreId,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([conn?.key, "z", ...parentPath]);
      },
    },
  );
  return (
    <Dialog
      title="Change Store ID and URL"
      onClose={onClose}
      closeLabel="Cancel"
      confirmLabel="Move Store"
      formSchema={
        {
          ...IDSchema,
          title: "New Store ID",
        } as const
      }
      message={`Set a new store ID. This will BREAK any clients who use the current URL.`}
      onConfirm={async (storeId: string) => {
        await moveStore.mutateAsync(storeId);
        onClose();
        onStoreRename(storeId);
      }}
    />
  );
}

function DeleteStoreDialog({
  onClose,
  storePath,
  onStoreDelete,
}: {
  onClose: () => void;
  storePath: string[];
  onStoreDelete: () => void;
}) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const storeId = storePath.at(-1);
  const deleteStore = useMutation(
    async () => {
      await postZAction(
        conn,
        [...storePath.slice(0, -2), "destroyStore"],
        storeId,
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...storePath.slice(0, -1),
        ]);
      },
    },
  );
  return (
    <Dialog
      title="Really destroy?"
      onClose={onClose}
      closeLabel="Cancel"
      confirmLabel="Delete Store"
      danger
      message={`Are you sure you want to permanently delete the "${storeId}" store?`}
      onConfirm={async () => {
        await deleteStore.mutateAsync();
        onClose();
        onStoreDelete();
      }}
    />
  );
}

function useDeleteStoreDialog(storePath: string[], onStoreDelete: () => void) {
  return useModal<void>(({ onClose }) => (
    <DeleteStoreDialog
      onClose={onClose}
      storePath={storePath}
      onStoreDelete={onStoreDelete}
    />
  ));
}

function useRenameStoreDialog(
  storePath: string[],
  onStoreRename: (name: string) => void,
) {
  return useModal<void>(({ onClose }) => (
    <RenameStoreDialog
      onClose={onClose}
      storePath={storePath}
      onStoreRename={onStoreRename}
    />
  ));
}

function useStoreSettings(storePath: string[]) {
  const storeId = storePath.at(-1);
  const parentPath = storePath.slice(0, -2);
  if (!storeId) throw new Error("Could not determine storeId from storePath");
  return useZNodeValue([...parentPath, "storeSettings", storeId]);
}
function useSetStoreSettings(storePath: string[]) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const storeId = storePath.at(-1);
  const parentPath = storePath.slice(0, -2);
  return useMutation(
    async (settings: StoreSettingsType) => {
      await postZAction(conn, [...parentPath, "writeStoreSettings"], {
        storeId,
        settings,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...parentPath,
          "stores",
          storeId,
        ]);
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...parentPath,
          "storeSettings",
          storeId,
        ]);
      },
    },
  );
}

function ExperimentalSchemas({
  settings,
  onSettings,
}: {
  settings: StoreSettingsType;
  onSettings: (settings: StoreSettingsType) => Promise<void>;
}) {
  return (
    <>
      {AllExperimentalSchemas.map((experimentalSchemaName) => (
        <HStack>
          <Label>{experimentalSchemaName}</Label>
          <SwitchInput
            value={!!settings?.enabledSchemas?.[experimentalSchemaName]}
            onValue={(isEnabled) =>
              onSettings({
                ...settings,
                enabledSchemas: {
                  ...settings.enabledSchemas,
                  [experimentalSchemaName]: isEnabled,
                },
              })
            }
          />
        </HStack>
      ))}
    </>
  );
}

function StoreSettings({
  storePath,
  onStoreDelete,
  onStoreRename,
  title,
  icon,
  isActive,
  onBack,
}: StoreFeatureProps) {
  const onDeleteStoreDialog = useDeleteStoreDialog(storePath, onStoreDelete);
  const onRenameStoreDialog = useRenameStoreDialog(storePath, onStoreRename);
  const settingsQuery = useStoreSettings(storePath);
  const setSettings = useSetStoreSettings(storePath);
  return (
    <FeaturePane
      title={title}
      icon={icon}
      isActive={isActive}
      onBack={onBack}
      spinner={settingsQuery.isFetching}
    >
      <VStack padded>
        <Title title="Experimental Schemas:" />
        {settingsQuery.data ? (
          <ExperimentalSchemas
            settings={settingsQuery.data}
            onSettings={setSettings.mutateAsync}
          />
        ) : null}
        <Title title="Dangerous:" />
        <Button danger title="Rename Store" onPress={onRenameStoreDialog} />
        <Button danger title="Delete Store" onPress={onDeleteStoreDialog} />
      </VStack>
    </FeaturePane>
  );
}

export const StoreSettingsFeature = memo(StoreSettings);
