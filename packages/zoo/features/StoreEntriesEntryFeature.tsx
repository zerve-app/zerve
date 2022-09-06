import {
  AnyError,
  displayStoreFileName,
  drillSchemaValue,
  EmptySchemaStore,
  expandSchema,
  isEmptySchema,
  lookUpValue,
  mergeValue,
  prepareStoreFileName,
} from "@zerve/zed";
import {
  Button,
  getValueExport,
  getValueImport,
  HStack,
  HumanTextInput,
  JSONSchemaEditor,
  JSONSchemaEditorContext,
  Label,
  showToast,
  Spacer,
  Title,
  useAsyncHandler,
  useTextInputFormModal,
  VSpaced,
  VStack,
} from "@zerve/zen";
import { memo, useEffect, useMemo, useState } from "react";
import { FeaturePane } from "../web/Dashboard";
import {
  useDeleteEntry,
  useRenameEntry,
  useSaveEntry,
} from "@zerve/zoo-client/Mutation";
import {
  StoreFeatureLink,
  StoreFeatureLinkButton,
  StoreFeatureProps,
  useUnsavedContext,
} from "../context/StoreDashboardContext";
import { useZNodeValue, useZStoreSchemas } from "@zerve/zoo-client/Query";
import { Notice } from "@zerve/zen/Notice";
import { useStoreNavigation } from "../app/useStoreNavigation";

function extractErrorMessage(error: AnyError) {
  let message = error.message;
  if (error.details?.errors) {
    message = error.details.errors
      .map((error) => {
        if (error.dataPath) {
          return `${error.dataPath} invalid: ${error.message}`;
        }
        return error.message;
      })
      .join("\n\n");
  }
  return message;
}

function EmptyEntryContent({
  entryName,
  path,
}: {
  entryName: string;
  path: Array<string>;
}) {
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
          entryName,
          path,
          child: "schema",
        }}
      />
    </VStack>
  );
}

function StoreEntriesEntry({
  storePath,
  entryName,
  path,
  title,
}: StoreFeatureProps & { entryName: string; path: Array<string> }) {
  const saveEntry = useSaveEntry(storePath);
  const schemasQuery = useZStoreSchemas(storePath);
  const entryQuery = useZNodeValue([...storePath, "State", entryName]);
  const { openEntry, openEntrySchema, replaceToEntries, replaceToEntry } =
    useStoreNavigation();
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
  const entrySchema = entryQuery.data?.schema;
  const savedEntryValue = entryQuery.data?.value;
  const schemaStore = schemasQuery.data || EmptySchemaStore;

  const [importValue, exportValue] = useMemo(() => {
    return [
      getValueImport(editorContext.OverrideFieldComponents),
      getValueExport(editorContext.OverrideFieldComponents),
    ];
  }, [editorContext.OverrideFieldComponents]);

  const dirtyId = `entry-${entryName}`;
  const fullSchema = useMemo(() => {
    const expanded = entrySchema && expandSchema(entrySchema, schemaStore);
    return expanded;
  }, [entrySchema, schemaStore]);
  const { schema: pathSchema, value: savedPathValue } = useMemo(() => {
    const importedValue =
      savedEntryValue === undefined
        ? undefined
        : importValue(savedEntryValue, fullSchema);
    return drillSchemaValue(fullSchema, importedValue, path);
  }, [fullSchema, savedEntryValue, path]);

  const {
    claimDirty,
    releaseDirty,
    dirtyId: currentDirtyId,
    getDirtyValue,
  } = useUnsavedContext();
  const isDirty = currentDirtyId === dirtyId;
  const [draftValue, setDraftValue] = useState(
    isDirty ? lookUpValue(getDirtyValue(dirtyId), path) : undefined,
  );
  const doSave = useAsyncHandler<void, AnyError>(async () => {
    const internalValue = getDirtyValue(dirtyId);
    const exportedValue = exportValue(internalValue, fullSchema);
    await saveEntry.mutateAsync({
      name: entryName,
      value: exportedValue,
    });
    releaseDirty(dirtyId);
  });
  const displayValue = draftValue === undefined ? savedPathValue : draftValue;
  return (
    <FeaturePane
      title={title}
      spinner={
        saveEntry.isLoading || schemasQuery.isFetching || entryQuery.isFetching
      }
      actions={[
        {
          key: "Refresh",
          title: "Refresh",
          icon: "refresh",
          onPress: () => {
            entryQuery.refetch();
            entryQuery.refetch();
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
      {!(savedEntryValue !== undefined || !schemaStore) ? null : isEmptySchema(
          entrySchema,
        ) ? (
        <EmptyEntryContent entryName={entryName} path={path} />
      ) : (
        <JSONSchemaEditorContext.Provider value={editorContext}>
          <VStack padded>
            {doSave.error ? (
              <Notice
                danger
                message={extractErrorMessage(doSave.error)}
                icon="exclamation-circle"
              />
            ) : null}
            <JSONSchemaEditor
              id={`entry-${entryName}-${path.join("-")}`}
              onValue={(value: any) => {
                setDraftValue(value);
                const prevEntryValue =
                  currentDirtyId === dirtyId
                    ? getDirtyValue(dirtyId)
                    : savedEntryValue;
                const updatedValue = path.length
                  ? mergeValue(prevEntryValue, path, value)
                  : value;
                claimDirty(dirtyId, updatedValue);
              }}
              value={displayValue}
              schema={pathSchema}
              schemaStore={schemaStore}
            />
          </VStack>
          <Spacer />
          {isDirty &&
            (path.length ? (
              <StoreFeatureLink
                title="Unsaved Changes. Go Back to Save"
                to={{
                  key: "entries",
                  entryName,
                  path: path.slice(0, -1),
                }}
                icon="backward"
              />
            ) : (
              <HStack padded>
                <Button
                  chromeless
                  title="Discard"
                  onPress={() => {
                    doSave.reset();
                    setDraftValue(undefined);
                    releaseDirty(dirtyId);
                  }}
                />
                <Button primary title="Save Changes" onPress={doSave.handle} />
              </HStack>
            ))}
        </JSONSchemaEditorContext.Provider>
      )}
    </FeaturePane>
  );
}

export const StoreEntriesEntryFeature = memo(StoreEntriesEntry);
