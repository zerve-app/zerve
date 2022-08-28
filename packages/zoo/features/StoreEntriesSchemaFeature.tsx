import {
  Button,
  HStack,
  JSONSchemaEditor,
  JSONSchemaEditorContext,
  JSONSchemaForm,
  showToast,
  Spacer,
  Title,
  useAsyncHandler,
  VStack,
} from "@zerve/zen";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { FeaturePane } from "../web/Dashboard";
import { useSaveEntry, useSaveEntrySchema } from "@zerve/client/Mutation";
import {
  StoreFeatureLink,
  StoreFeatureProps,
  useUnsavedContext,
} from "../context/StoreDashboardContext";
import {
  useZNodeValue,
  useZStoreEntrySchema,
  useZStoreSchema,
  useZStoreSchemas,
} from "@zerve/client/Query";
import { useStoreNavigation } from "../app/useNavigation";
import {
  AnyError,
  drillSchemaValue,
  EmptySchemaStore,
  exploreUnionSchema,
  JSONSchema,
  lookUpValue,
  mergeValue,
} from "@zerve/zed";

function StoreEntriesSchema({
  storePath,
  location,
  entryName,
  path,
  title,
}: StoreFeatureProps & { entryName: string; path: Array<string> }) {
  const schemaSchemaQuery = useZStoreEntrySchema(storePath);
  const schemaStore = schemaSchemaQuery.data?.$schemaStore;
  const saveSchema = useSaveEntrySchema(storePath, schemaStore);
  const entrySchemaQuery = useZNodeValue([
    ...storePath,
    "State",
    entryName,
    "schema",
  ]);
  const { claimDirty, releaseDirty, dirtyIds, getDirtyValue } =
    useUnsavedContext();
  const { openEntrySchema } = useStoreNavigation(location);
  const dirtyId = `entry-schema-${entryName}`;
  const isDirty = dirtyIds.has(dirtyId);
  const [draftValue, setDraftValue] = useState(
    isDirty ? lookUpValue(getDirtyValue(dirtyId), path) : undefined,
  );
  const editorContext = useMemo(() => {
    const ctx: JSONSchemaEditorContext = {
      openChildEditor: (key: string) => {
        openEntrySchema(entryName, [...path, key]);
      },
    };
    return ctx;
  }, []);
  const savedSchemaValue = entrySchemaQuery.data;
  const { schema: pathSchema, value: savedPathValue } = useMemo(
    () => drillSchemaValue(schemaSchemaQuery.data, savedSchemaValue, path),
    [schemaSchemaQuery.data, savedSchemaValue, path],
  );
  const doSave = useAsyncHandler<void, AnyError>(async () => {
    await saveSchema.mutateAsync({
      name: entryName,
      schema: getDirtyValue(dirtyId),
    });
    releaseDirty(dirtyId);
  });
  return (
    <FeaturePane
      title={title}
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
                onValue={(value: any) => {
                  setDraftValue(value);
                  if (path.length && !dirtyIds.has(dirtyId)) {
                    claimDirty(
                      dirtyId,
                      [],
                      mergeValue(savedSchemaValue, path, value),
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

export const StoreEntriesSchemaFeature = memo(StoreEntriesSchema);
