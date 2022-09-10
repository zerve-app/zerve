import {
  JSONSchemaEditorContext,
  useTextInputFormModal,
  VStack,
  JSONSchemaEditor,
  HStack,
  Button,
  Spacer,
  useAsyncHandler,
} from "@zerve/zen";
import { memo, useMemo } from "react";
import { FeaturePane } from "../components/FeaturePane";
import {
  useDeleteSchema,
  useRenameSchema,
  useSaveSchema,
} from "@zerve/zoo-client/Mutation";
import {
  StoreFeatureLink,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import {
  useZStoreSchema,
  useZStoreSchemaSchema,
} from "@zerve/zoo-client/Query";
import { AnyError, prepareStoreFileName } from "@zerve/zed";
import { useStoreNavigation } from "../app/useStoreNavigation";
import { useUnsavedDeepValue } from "../app/Unsaved";
import { SaveOrDiscardFooter } from "../components/SaveOrDiscardFooter";
import { BackToSaveButton } from "../components/BackToSaveButton";

function StoreSchemasSchema({
  storePath,
  schema: schemaName,
  title,
  onBack,
  icon,
  path,
  isActive,
}: StoreFeatureProps & { schema: string; path: string[] }) {
  const schemaSchemaQuery = useZStoreSchemaSchema(storePath, schemaName);
  const schemaQuery = useZStoreSchema(storePath, schemaName);
  const schemaStore = schemaSchemaQuery.data?.$schemaStore;

  const deleteSchema = useDeleteSchema(storePath);
  const saveSchema = useSaveSchema(storePath);

  const { openSchema, replaceToSchemas, replaceToSchema, backToSchema } =
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

  const dirtyId = `schema-${schemaName}`;
  const {
    pathValue,
    pathSchema,
    onPathValue,
    releaseDirty,
    getDirty,
    isDirty,
  } = useUnsavedDeepValue({
    isActive,
    path,
    savedValue: schemaQuery.data,
    fullSchema: schemaSchemaQuery.data, // todo, expand?!
    dirtyId,
  });
  const doSave = useAsyncHandler<void, AnyError>(async () => {
    await saveSchema.mutateAsync({
      schemaName,
      schema: getDirty(),
    });
    releaseDirty();
  });
  return (
    <FeaturePane
      title={title}
      icon={icon}
      onBack={onBack}
      actions={schemaActions}
      spinner={
        saveSchema.isLoading ||
        deleteSchema.isLoading ||
        schemaSchemaQuery.isFetching ||
        schemaQuery.isFetching
      }
      footer={
        isDirty &&
        (path.length ? (
          <BackToSaveButton
            onPress={() => {
              backToSchema(schemaName, path);
            }}
          />
        ) : (
          <SaveOrDiscardFooter
            onSave={doSave.handle}
            onDiscard={() => {
              doSave.reset();
              releaseDirty();
            }}
          />
        ))
      }
    >
      <JSONSchemaEditorContext.Provider value={editorContext}>
        {schemaQuery.data && pathSchema ? (
          <VStack padded>
            <JSONSchemaEditor
              id={`schema-${schemaName}-${path.join("-")}`}
              onValue={onPathValue}
              value={pathValue}
              schema={pathSchema}
              schemaStore={schemaStore}
            />
          </VStack>
        ) : null}
      </JSONSchemaEditorContext.Provider>
    </FeaturePane>
  );
}

export const StoreSchemasSchemaFeature = memo(StoreSchemasSchema);
