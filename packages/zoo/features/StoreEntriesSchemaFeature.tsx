import {
  JSONSchemaEditorContext,
  JSONSchemaForm,
  showToast,
  Title,
  useAsyncHandler,
} from "@zerve/zen";
import { memo, useMemo, useRef } from "react";
import { FeaturePane } from "../web/Dashboard";
import { useSaveEntry, useSaveEntrySchema } from "@zerve/client/Mutation";
import {
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
  drillSchemaValue,
  EmptySchemaStore,
  exploreUnionSchema,
  JSONSchema,
} from "@zerve/core";

function StoreEntriesSchema({
  storePath,
  location,
  entryName,
  path,
  title,
}: StoreFeatureProps & { entryName: string; path: Array<string> }) {
  const saveEntry = useSaveEntry(storePath);
  const schemas = useZStoreEntrySchema(storePath);
  const saveSchema = useSaveEntrySchema(storePath, schemas.data?.$schemaStore);
  const entry = useZNodeValue([...storePath, "State", entryName, "schema"]);
  const { claimDirty, releaseDirty } = useUnsavedContext();
  const { openEntrySchema } = useStoreNavigation(location);
  const editorContext = useMemo(() => {
    const ctx: JSONSchemaEditorContext = {
      openChildEditor: (key: string) => {
        openEntrySchema(entryName, [...path, key]);
      },
    };
    return ctx;
  }, []);
  const { schema: displaySchema, value: displayValue } = useMemo(
    () => drillSchemaValue(schemas.data, entry.data, path),
    [schemas.data, entry.data, path],
  );
  const dirtyId = `entry-schema-${entryName}`;
  return (
    <FeaturePane
      title={title}
      spinner={saveEntry.isLoading || schemas.isFetching || entry.isFetching}
    >
      <JSONSchemaEditorContext.Provider value={editorContext}>
        {entry.data && schemas.data ? (
          <JSONSchemaForm
            id={`entry-schema-${path.join("-")}`}
            saveLabel="Save Schema"
            value={displayValue}
            onDirty={() => claimDirty(dirtyId, path, "fuckk")}
            onValue={async (schema) => {
              await saveSchema.mutateAsync({ name: entryName, schema });
              releaseDirty(dirtyId);
              showToast("Schema has been updated.");
            }}
            onCancel={() => {
              releaseDirty(dirtyId);
            }}
            schema={displaySchema}
            padded
          />
        ) : null}
      </JSONSchemaEditorContext.Provider>
    </FeaturePane>
  );
}

export const StoreEntriesSchemaFeature = memo(StoreEntriesSchema);
