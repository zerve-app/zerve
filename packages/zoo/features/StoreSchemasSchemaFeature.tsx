import {
  showToast,
  JSONSchemaForm,
  JSONSchemaEditorContext,
  useTextInputFormModal,
} from "@zerve/zen";
import React, { memo, useMemo } from "react";
import { FeaturePane } from "../web/Dashboard";
import {
  useDeleteSchema,
  useRenameSchema,
  useSaveSchema,
} from "@zerve/client/Mutation";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import {
  useZNodeValue,
  useZStoreSchema,
  useZStoreSchemaSchema,
} from "@zerve/client/Query";
import { useStoreNavigation } from "../app/useNavigation";
import { drillSchemaValue, prepareStoreFileName } from "@zerve/core";

function StoreSchemasSchema({
  storePath,
  location,
  schema: schemaName,
  title,
  path,
}: StoreFeatureProps & { schema: string; path: string[] }) {
  const schemaSchemaQuery = useZStoreSchemaSchema(storePath, schemaName);
  const schemaQuery = useZStoreSchema(storePath, schemaName);
  const deleteSchema = useDeleteSchema(storePath);
  const { openSchema, replaceToSchemas, replaceToSchema } =
    useStoreNavigation(location);
  const saveSchema = useSaveSchema(storePath);
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
  const { schema: displaySchema, value: displayValue } = useMemo(
    () =>
      schemaSchemaQuery.data
        ? drillSchemaValue(schemaSchemaQuery.data, schemaQuery.data, path)
        : { schema: undefined, value: undefined },
    [schemaSchemaQuery.data, schemaQuery.data, path],
  );
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
      {schemaQuery.data && schemaSchemaQuery.data ? (
        <JSONSchemaEditorContext.Provider value={editorContext}>
          <JSONSchemaForm
            id={`file-schema-${schemaName}`}
            saveLabel="Save Schema"
            saveIcon="check-circle"
            value={displayValue}
            onValue={async (schemaValue) => {
              await saveSchema.mutateAsync({
                schemaName,
                schema: schemaValue,
              });
              showToast("Schema has been updated.");
            }}
            schema={displaySchema}
            padded
          />
        </JSONSchemaEditorContext.Provider>
      ) : null}
    </FeaturePane>
  );
}

export const StoreSchemasSchemaFeature = memo(StoreSchemasSchema);
