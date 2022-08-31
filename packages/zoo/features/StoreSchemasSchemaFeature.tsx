import {
  showToast,
  JSONSchemaForm,
  JSONSchemaEditorContext,
  useTextInputFormModal,
  VStack,
  JSONSchemaEditor,
  HStack,
  Button,
  Spacer,
  useAsyncHandler,
} from "@zerve/zen";
import React, { memo, useMemo, useState } from "react";
import { FeaturePane } from "../web/Dashboard";
import {
  useDeleteSchema,
  useRenameSchema,
  useSaveSchema,
} from "@zerve/zoo-client/Mutation";
import {
  StoreFeatureLink,
  StoreFeatureProps,
  useUnsavedContext,
} from "../context/StoreDashboardContext";
import {
  useZNodeValue,
  useZStoreSchema,
  useZStoreSchemaSchema,
} from "@zerve/zoo-client/Query";
import { useStoreNavigation } from "../app/useNavigation";
import {
  AnyError,
  drillSchemaValue,
  lookUpValue,
  mergeValue,
  prepareStoreFileName,
} from "@zerve/zed";

function StoreSchemasSchema({
  storePath,
  schema: schemaName,
  title,
  path,
}: StoreFeatureProps & { schema: string; path: string[] }) {
  const schemaSchemaQuery = useZStoreSchemaSchema(storePath, schemaName);
  const schemaQuery = useZStoreSchema(storePath, schemaName);
  const schemaStore = schemaSchemaQuery.data?.$schemaStore;

  const deleteSchema = useDeleteSchema(storePath);
  const saveSchema = useSaveSchema(storePath);

  const { openSchema, replaceToSchemas, replaceToSchema } =
    useStoreNavigation();
  const editorContext = useMemo(() => {
    const ctx: JSONSchemaEditorContext = {
      openChildEditor: (key: string) => {
        openSchema(schemaName, [...path, key]);
      },
    };
    return ctx;
  }, []);

  const renameSchema = useRenameSchema(storePath);
  const renameSchemaPrompt = useTextInputFormModal<string>(
    (prevName: string) => {
      return {
        inputLabel: "New Entry Name",
        defaultValue: prevName,
        onValue: async (inputName: string) => {
          const formattedName = prepareStoreFileName(inputName);
          renameSchema.mutateAsync({
            prevName: schemaName,
            newName: formattedName,
          });
          replaceToSchema(formattedName);
        },
      };
    },
  );
  const schemaActions = useMemo(() => {
    return [
      {
        key: "delete",
        title: "Delete",
        icon: "trash",
        danger: true,
        onPress: async () => {
          await deleteSchema.mutateAsync(schemaName);
          replaceToSchemas();
        },
      },
      {
        key: "rename",
        title: "Rename",
        icon: "edit",
        onPress: async () => {
          renameSchemaPrompt(schemaName);
        },
      },
    ];
  }, [schemaName]);

  const { claimDirty, releaseDirty, dirtyIds, getDirtyValue } =
    useUnsavedContext();
  const dirtyId = `schema-${schemaName}`;
  const isDirty = dirtyIds.has(dirtyId);
  const currentDirtyValue = getDirtyValue(dirtyId);
  const [draftValue, setDraftValue] = useState(
    isDirty ? lookUpValue(currentDirtyValue, path) : undefined,
  );
  const currentValue = currentDirtyValue || schemaQuery.data;
  const { schema: pathSchema, value: savedPathValue } = useMemo(
    () =>
      schemaSchemaQuery.data
        ? drillSchemaValue(schemaSchemaQuery.data, currentValue, path)
        : { schema: undefined, value: undefined },
    [schemaSchemaQuery.data, currentValue, path],
  );

  const doSave = useAsyncHandler<void, AnyError>(async () => {
    await saveSchema.mutateAsync({
      schemaName,
      schema: getDirtyValue(dirtyId),
    });
    releaseDirty(dirtyId);
  });
  return (
    <FeaturePane
      title={title}
      actions={schemaActions}
      spinner={
        saveSchema.isLoading ||
        deleteSchema.isLoading ||
        schemaSchemaQuery.isFetching ||
        schemaQuery.isFetching
      }
    >
      <JSONSchemaEditorContext.Provider value={editorContext}>
        {schemaQuery.data && pathSchema ? (
          <>
            <VStack padded>
              <JSONSchemaEditor
                id={`schema-${schemaName}-${path.join("-")}`}
                onValue={(value: any) => {
                  setDraftValue(value);
                  if (path.length && !dirtyIds.has(dirtyId)) {
                    claimDirty(
                      dirtyId,
                      [],
                      mergeValue(currentValue, path, value),
                    );
                  } else {
                    claimDirty(dirtyId, path, value);
                  }
                }}
                value={draftValue === undefined ? savedPathValue : draftValue}
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
                    key: "schemas",
                    schema: schemaName,
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
                      setDraftValue(undefined);
                      releaseDirty(dirtyId);
                    }}
                  />
                  <Button primary title="Save Schema" onPress={doSave.handle} />
                </HStack>
              ))}
          </>
        ) : null}
      </JSONSchemaEditorContext.Provider>
    </FeaturePane>
  );
}

export const StoreSchemasSchemaFeature = memo(StoreSchemasSchema);
