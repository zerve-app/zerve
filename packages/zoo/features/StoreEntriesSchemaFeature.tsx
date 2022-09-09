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

  const { openEntrySchema } = useStoreNavigation();
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
    >
      <JSONSchemaEditorContext.Provider value={editorContext}>
        {entrySchemaQuery.data && schemaSchemaQuery.data ? (
          <>
            <VStack padded>
              <JSONSchemaEditor
                id={dirtyId}
                onValue={onPathValue}
                value={pathValue}
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
                    child: "schema",
                    path: path.slice(0, -1),
                  }}
                  icon="backward"
                />
              ) : (
                <HStack padded>
                  <Button
                    chromeless
                    danger
                    title="Discard"
                    onPress={() => {
                      releaseDirty();
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

export const StoreEntriesSchemaFeature = memo(StoreEntriesSchema);
