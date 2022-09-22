import {
  JSONSchemaEditorContext,
  useTextInputFormModal,
  VStack,
  JSONSchemaEditor,
  useAsyncHandler,
} from "@zerve/zen";
import { memo, useContext, useMemo } from "react";
import { FeaturePane } from "../components/FeaturePane";
import {
  useDeleteSchema,
  useRenameSchema,
  useSaveStoreSchema,
} from "@zerve/zoo-client/Mutation";
import {
  StoreDashboardContext,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import { AnyError, prepareStoreFileName } from "@zerve/zed";
import { useStoreNavigation } from "../app/useStoreNavigation";
import { useUnsavedDeepValue } from "../app/Unsaved";
import { SaveOrDiscardFooter } from "../components/SaveOrDiscardFooter";
import { BackToSaveButton } from "../components/BackToSaveButton";
import { useStoreSchema } from "../app/StoreClient";
import { Notice } from "@zerve/zen/Notice";
import { extractErrorMessage } from "@zerve/zen/ErrorHandling";
import { ErrorRow } from "../components/Error";

function StoreSchemasSchema({
  storePath,
  schema: schemaName,
  title,
  onBack,
  icon,
  path,
  isActive,
}: StoreFeatureProps & { schema: string; path: string[] }) {
  const schemaQuery = useStoreSchema(storePath, schemaName);

  const deleteSchema = useDeleteSchema(storePath);
  const saveSchema = useSaveStoreSchema(storePath);

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
    savedPathValue,
    onPathValue,
    releaseDirty,
    getDirty,
    isDirty,
  } = useUnsavedDeepValue({
    isActive,
    path,
    savedValue: schemaQuery.data?.schema,
    fullSchema: schemaQuery.data?.schemaSchema,
    dirtyId,
  });
  const doSave = useAsyncHandler<void, AnyError>(async () => {
    await saveSchema.mutateAsync({
      schemaName,
      schema: getDirty(),
    });
    releaseDirty();
  });
  const fragmentContext = useContext(StoreDashboardContext);
  const activeFragment = fragmentContext?.fragment;
  let hasChildActive =
    !!activeFragment &&
    activeFragment.key === "schemas" &&
    activeFragment.schema === schemaName;
  const activeChild =
    (!!activeFragment &&
      activeFragment.key === "schemas" &&
      activeFragment.path &&
      activeFragment.path.find(
        (pathTerm: string, index: number, activePath: string[]) => {
          if (path.length < activePath.length)
            return hasChildActive && path.length === index;
          if (path[index] !== pathTerm) hasChildActive = false;
          return false;
        },
      )) ||
    undefined;
  return (
    <FeaturePane
      title={title}
      icon={icon}
      isActive={isActive}
      onBack={onBack}
      actions={schemaActions}
      spinner={
        saveSchema.isLoading || deleteSchema.isLoading || schemaQuery.isFetching
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
      {doSave.error ? (
        <ErrorRow message={extractErrorMessage(doSave.error)} />
      ) : null}
      {schemaQuery.error ? (
        <ErrorRow message={"Could not Load: " + schemaQuery.error.message} />
      ) : null}
      <JSONSchemaEditorContext.Provider value={editorContext}>
        {schemaQuery.data && pathSchema ? (
          <VStack padded>
            <JSONSchemaEditor
              id={`${dirtyId}-${path.join("-")}`}
              onValue={onPathValue}
              value={pathValue}
              activeChild={activeChild}
              comparisonValue={savedPathValue}
              schema={pathSchema}
              schemaStore={schemaQuery.data?.schemaStore}
            />
          </VStack>
        ) : null}
      </JSONSchemaEditorContext.Provider>
    </FeaturePane>
  );
}

export const StoreSchemasSchemaFeature = memo(StoreSchemasSchema);
