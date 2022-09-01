import {
  Button,
  HStack,
  Label,
  SwitchInput,
  ThemedText,
  Title,
  useModal,
  VStack,
} from "@zerve/zen";
import { Dialog, useDialog } from "@zerve/zen/Dialog";
import { memo, useContext } from "react";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import { FeaturePane } from "../web/Dashboard";
import { useMutation, useQueryClient } from "react-query";
import { useRequiredConnection } from "@zerve/zoo-client/Connection";
import { postZAction } from "@zerve/zoo-client/ServerCalls";
import { useRouter } from "next/router";
import {
  AllExperimentalSchemas,
  IDSchema,
  StoreSettings,
  StringSchema,
} from "@zerve/zed";
import { useZNode, useZNodeValue } from "@zerve/zoo-client/Query";

function RenameStoreDialog({
  onClose,
  storePath,
  href,
}: {
  onClose: () => void;
  storePath: string[];
  href: string;
}) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const parentPath = storePath.slice(0, -2); // trim off 'Stores/${storeId}' from storePath
  const storeId = storePath.at(-1);
  const moveStore = useMutation(
    async (newStoreId: string) => {
      await postZAction(conn, [...parentPath, "MoveStore"], {
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
  const parentLocation = href.split("/").slice(0, -1);
  const { push } = useRouter();
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
        push(`${[...parentLocation, storeId].join("/")}`);
      }}
    />
  );
}

function DeleteStoreDialog({
  onClose,
  storePath,
  href,
}: {
  onClose: () => void;
  storePath: string[];
  href: string;
}) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const storeId = storePath.at(-1);
  const deleteStore = useMutation(
    async () => {
      await postZAction(
        conn,
        [...storePath.slice(0, -2), "DestroyStore"],
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
  const parentLocation = href.split("/").slice(0, -1);
  const afterDeleteHref = parentLocation.join("/");
  const { push } = useRouter();
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
        push(afterDeleteHref);
      }}
    />
  );
}

function useDeleteStoreDialog(storePath: string[], href: string) {
  return useModal<void>(({ onClose }) => (
    <DeleteStoreDialog onClose={onClose} storePath={storePath} href={href} />
  ));
}

function useRenameStoreDialog(storePath: string[], href: string) {
  return useModal<void>(({ onClose }) => (
    <RenameStoreDialog onClose={onClose} storePath={storePath} href={href} />
  ));
}

function useStoreSettings(storePath: string[]) {
  const storeId = storePath.at(-1);
  const parentPath = storePath.slice(0, -2);
  return useZNodeValue([...parentPath, "StoreSettings", storeId]);
}
function useSetStoreSettings(storePath: string[]) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const storeId = storePath.at(-1);
  const parentPath = storePath.slice(0, -2);
  return useMutation(
    async (settings: StoreSettings) => {
      await postZAction(conn, [...parentPath, "WriteStoreSettings"], {
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
          "Stores",
          storeId,
        ]);
        queryClient.invalidateQueries([
          conn?.key,
          "z",
          ...parentPath,
          "StoreSettings",
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
  settings: StoreSettings;
  onSettings: (settings: StoreSettings) => Promise<void>;
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
  // return <ThemedText>{JSON.stringify(settings.data)}</ThemedText>;
}

function StoreSettings({ storePath, href, title }: StoreFeatureProps) {
  const onDeleteStoreDialog = useDeleteStoreDialog(storePath, href);
  const onRenameStoreDialog = useRenameStoreDialog(storePath, href);
  const settingsQuery = useStoreSettings(storePath);
  const setSettings = useSetStoreSettings(storePath);
  return (
    <FeaturePane title={title} spinner={settingsQuery.isFetching}>
      <VStack padded>
        <Title title="Experimental Schemas:" />
        {settingsQuery.data && (
          <ExperimentalSchemas
            settings={settingsQuery.data}
            onSettings={setSettings.mutate}
          />
        )}
        <Title title="Dangerous:" />
        <Button danger title="Rename Store" onPress={onRenameStoreDialog} />
        <Button danger title="Delete Store" onPress={onDeleteStoreDialog} />
      </VStack>
    </FeaturePane>
  );
}

export const StoreSettingsFeature = memo(StoreSettings);
