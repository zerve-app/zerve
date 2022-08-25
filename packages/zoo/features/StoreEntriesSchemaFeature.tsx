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
  connectionSchemasToZSchema,
  useZNodeValue,
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
  const schemas = useZStoreSchemas(storePath);
  const saveSchema = useSaveEntrySchema(storePath, schemas.data);
  const fullSchema = useMemo(() => {
    return connectionSchemasToZSchema(schemas.data);
  }, [schemas.data]);
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
    () => drillSchemaValue(fullSchema, entry.data, path),
    [fullSchema, entry.data, path],
  );

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
            onDirty={claimDirty}
            onValue={async (schema) => {
              await saveSchema.mutateAsync({ name: entryName, schema });
              releaseDirty();
              showToast("Schema has been updated.");
            }}
            onCancel={() => {
              releaseDirty();
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
