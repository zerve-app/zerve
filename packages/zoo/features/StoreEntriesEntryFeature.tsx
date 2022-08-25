import { useConnection, useRequiredConnection } from "@zerve/client/Connection";
import { postZAction } from "@zerve/client/ServerCalls";
import {
  AllJSONSchemaType,
  displayStoreFileName,
  drillSchemaValue,
  EmptySchemaStore,
  expandSchema,
  JSONSchema,
  prepareStoreFileName,
  SchemaStore,
} from "@zerve/core";
import {
  HumanTextInput,
  JSONSchemaEditorContext,
  JSONSchemaForm,
  Label,
  showToast,
  ThemedText,
  Title,
  useAsyncHandler,
  useTextInputFormModal,
  VSpaced,
  VStack,
} from "@zerve/zen";
import { memo, useCallback, useMemo } from "react";
import { FeaturePane, NavLink } from "../web/Dashboard";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";
import {
  useCreateEntry,
  useDeleteEntry,
  useRenameEntry,
  useSaveEntry,
} from "@zerve/client/Mutation";
import {
  StoreFeatureLinkButton,
  StoreFeatureProps,
  useUnsavedContext,
} from "../context/StoreDashboardContext";
import { useStoreNavigation } from "../app/useNavigation";
import {
  connectionSchemasToZSchema,
  useZNodeValue,
  useZStoreSchemas,
} from "@zerve/client/Query";

const EntryNameSchema = {
  type: "string",
  title: "Entry Name",
} as const;

function EntryContent({
  value,
  entryName,
  location,
  schema,
  schemaStore,
  path,
  onValue,
}: {
  value: any;
  entryName: string;
  location: string[];
  schema: JSONSchema;
  schemaStore: SchemaStore;
  onValue: (v: any) => Promise<void>;
  path: Array<string>;
}) {
  const fullSchema = useMemo(() => {
    return connectionSchemasToZSchema(schemaStore);
  }, [schemaStore]);
  const { openEntry } = useStoreNavigation(location);
  const editorContext = useMemo(() => {
    return {
      OverrideFieldComponents: {
        "https://type.zerve.link/HumanText": HumanTextInput,
      },
      openChildEditor: (key: string) => {
        openEntry(entryName, [...path, key]);
      },
    };
  }, []);
  const { schema: displaySchema, value: displayValue } = useMemo(() => {
    const fullSchema = expandSchema(schema, schemaStore);
    return drillSchemaValue(fullSchema, value, path);
  }, [schema, value, path, schemaStore]);
  const { claimDirty, releaseDirty } = useUnsavedContext();

  if (typeof schema == "object" && schema.type === "null")
    return (
      <VStack padded>
        <VSpaced space={4}>
          <Title
            secondary
            style={{ textAlign: "center" }}
            title="This Entry is Empty"
          />
        </VSpaced>
        <Label>You can modify the schema here:</Label>
        <StoreFeatureLinkButton
          title="Set Schema"
          icon="crosshairs"
          to={{
            key: "entries",
            path,
            child: "schema",
          }}
        />
      </VStack>
    );
  return (
    <JSONSchemaEditorContext.Provider value={editorContext}>
      <JSONSchemaForm
        id={`entry-${entryName}-${path.join("-")}`}
        onValue={onValue}
        onDirty={(value: any) => {
          claimDirty(`entry-${entryName}`, path, value);
        }}
        onCancel={() => {
          releaseDirty();
        }}
        value={displayValue}
        schema={displaySchema}
        schemaStore={schemaStore}
        padded
      />
    </JSONSchemaEditorContext.Provider>
  );
}

function StoreEntriesEntry({
  storePath,
  location,
  entryName,
  path,
  title,
}: StoreFeatureProps & { entryName: string; path: Array<string> }) {
  const saveEntry = useSaveEntry(storePath);
  const schemas = useZStoreSchemas(storePath);
  const entry = useZNodeValue([...storePath, "State", entryName]);
  const { openEntrySchema, replaceToEntries, replaceToEntry } =
    useStoreNavigation(location);
  const deleteFile = useDeleteEntry(
    storePath,
    useMemo(
      () => ({
        onSuccess: () =>
          showToast(`${displayStoreFileName(entryName)} Deleted`),
      }),
      [entryName],
    ),
  );
  const renameEntry = useRenameEntry(storePath);
  const renameEntryPrompt = useTextInputFormModal<string>(
    (prevName: string) => {
      return {
        inputLabel: "New Entry Name",
        defaultValue: prevName,
        onValue: (inputName: string) => {
          const formattedName = prepareStoreFileName(inputName);
          replaceToEntry(formattedName);
          renameEntry.mutate({ prevName: entryName, newName: formattedName });
        },
      };
    },
  );
  const { releaseDirty } = useUnsavedContext();
  return (
    <FeaturePane
      title={title}
      spinner={saveEntry.isLoading || schemas.isFetching || entry.isFetching}
      actions={[
        {
          key: "Refresh",
          title: "Refresh",
          icon: "refresh",
          onPress: () => {
            schemas.refetch();
            entry.refetch();
          },
        },
        {
          key: "EditSchema",
          title: "Edit Schema",
          icon: "crosshairs",
          onPress: () => {
            openEntrySchema(entryName);
          },
        },
        {
          key: "RenameEntry",
          title: "Rename Entry",
          icon: "edit",
          onPress: () => {
            renameEntryPrompt(entryName);
          },
        },
        {
          key: "delete",
          title: "Delete",
          icon: "trash",
          danger: true,
          onPress: async () => {
            await deleteFile.mutateAsync(entryName);
            replaceToEntries();
          },
        },
      ]}
    >
      {entry.data && schemas.data ? (
        <EntryContent
          path={path}
          location={location}
          entryName={entryName}
          onValue={async (value) => {
            await saveEntry.mutateAsync({ name: entryName, value });
            releaseDirty();
          }}
          value={entry.data.value}
          schema={entry.data.schema}
          schemaStore={schemas.data}
        />
      ) : null}
    </FeaturePane>
  );
}

export const StoreEntriesEntryFeature = memo(StoreEntriesEntry);
