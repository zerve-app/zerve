import {
  Button,
  HStack,
  JSONSchemaEditor,
  JSONSchemaEditorContext,
  Spacer,
  useAsyncHandler,
  VStack,
} from "@zerve/zen";
import { memo, useMemo, useState } from "react";
import { FeaturePane } from "../components/FeaturePane";
import { useSaveEntrySchema } from "@zerve/zoo-client/Mutation";
import {
  StoreFeatureLink,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import { useZNodeValue, useZStoreEntrySchema } from "@zerve/zoo-client/Query";
import {
  AnyError,
  drillSchemaValue,
  lookUpValue,
  mergeValue,
} from "@zerve/zed";
import { useStoreNavigation } from "../app/useStoreNavigation";
import { useUnsavedDeepValue } from "../app/Unsaved";
import { SaveOrDiscardFooter } from "../components/SaveOrDiscardFooter";
import { BackToSaveButton } from "../components/BackToSaveButton";

function StoreEntriesSchema({
  storePath,
  entryName,
  path,
  title,
  onBack,
  icon,
  isActive,
}: StoreFeatureProps & { entryName: string; path: Array<string> }) {
  const schemaSchemaQuery = useZStoreEntrySchema(storePath);
  const entrySchemaQuery = useZNodeValue([
    ...storePath,
    "State",
    entryName,
    "schema",
  ]);
  const schemaStore = schemaSchemaQuery.data?.$schemaStore;

  const saveSchema = useSaveEntrySchema(storePath, schemaStore);

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
    pathSchema,
    onPathValue,
    releaseDirty,
    getDirty,
    isDirty,
  } = useUnsavedDeepValue({
    isActive,
    path,
    savedValue: entrySchemaQuery.data,
    fullSchema: schemaSchemaQuery.data, // todo, expand?!
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
      spinner={
        doSave.isLoading ||
        schemaSchemaQuery.isFetching ||
        entrySchemaQuery.isFetching
      }
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
        {entrySchemaQuery.data && schemaSchemaQuery.data ? (
          <VStack padded>
            <JSONSchemaEditor
              id={dirtyId}
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

export const StoreEntriesSchemaFeature = memo(StoreEntriesSchema);
