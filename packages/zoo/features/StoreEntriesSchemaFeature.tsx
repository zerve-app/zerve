import {
  JSONSchemaEditor,
  JSONSchemaEditorContext,
  useAsyncHandler,
  VStack,
} from "@zerve/zen";
import { memo, useMemo } from "react";
import { FeaturePane } from "../components/FeaturePane";
import { useSaveEntrySchema } from "@zerve/zoo-client/Mutation";
import {
  StoreFeatureLink,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import { AnyError } from "@zerve/zed";
import { useStoreNavigation } from "../app/useStoreNavigation";
import { useUnsavedDeepValue } from "../app/Unsaved";
import { SaveOrDiscardFooter } from "../components/SaveOrDiscardFooter";
import { BackToSaveButton } from "../components/BackToSaveButton";
import { useStoreEntrySchema } from "../app/StoreClient";

function StoreEntriesSchema({
  storePath,
  entryName,
  path,
  title,
  onBack,
  icon,
  isActive,
}: StoreFeatureProps & { entryName: string; path: Array<string> }) {
  const entrySchemaQuery = useStoreEntrySchema(storePath, entryName);
  const saveSchema = useSaveEntrySchema(
    storePath,
    entrySchemaQuery.data?.schemaStore,
  );
  const { openEntrySchema, backToEntrySchema } = useStoreNavigation();
  const editorContext = useMemo(() => {
    const ctx: JSONSchemaEditorContext = {
      openChildEditor: (key: string) => {
        openEntrySchema(entryName, [...path, key]);
      },
    };
    return ctx;
  }, []);

  const dirtyId = `entry-schema-${entryName}`;

  const {
    pathValue,
    savedPathValue,
    pathSchema,
    onPathValue,
    releaseDirty,
    getDirty,
    isDirty,
  } = useUnsavedDeepValue({
    isActive,
    path,
    savedValue: entrySchemaQuery.data?.schema,
    fullSchema: entrySchemaQuery.data?.schemaSchema,
    dirtyId,
  });

  const doSave = useAsyncHandler<void, AnyError>(async () => {
    await saveSchema.mutateAsync({
      name: entryName,
      schema: getDirty(),
    });
    releaseDirty();
  });
  return (
    <FeaturePane
      title={title}
      onBack={onBack}
      icon={icon}
      spinner={doSave.isLoading || entrySchemaQuery.isFetching}
      footer={
        isDirty &&
        (path.length ? (
          <BackToSaveButton
            onPress={() => {
              backToEntrySchema(entryName, path);
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
        {entrySchemaQuery.data ? (
          <VStack padded>
            <JSONSchemaEditor
              id={dirtyId}
              onValue={onPathValue}
              value={pathValue}
              comparisonValue={savedPathValue}
              schema={pathSchema}
              schemaStore={entrySchemaQuery.data?.schemaStore}
            />
          </VStack>
        ) : null}
      </JSONSchemaEditorContext.Provider>
    </FeaturePane>
  );
}

export const StoreEntriesSchemaFeature = memo(StoreEntriesSchema);
