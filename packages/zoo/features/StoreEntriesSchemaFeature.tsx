import {
  JSONSchemaEditorContext,
  JSONSchemaForm,
  showToast,
  Title,
  useAsyncHandler,
} from "@zerve/zen";
import { memo, useMemo } from "react";
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

function StoreEntriesSchema({
  storePath,
  location,
  path,
  title,
}: StoreFeatureProps & { path: Array<string> }) {
  const saveEntry = useSaveEntry(storePath);
  const schemas = useZStoreSchemas(storePath);
  const saveSchema = useSaveEntrySchema(storePath, schemas.data);
  const fullSchema = useMemo(() => {
    return connectionSchemasToZSchema(schemas.data);
  }, [schemas.data]);
  const entry = useZNodeValue([...storePath, "State", path[0]]);
  const { claimDirty, releaseDirty } = useUnsavedContext();
  return (
    <FeaturePane
      title={title}
      spinner={saveEntry.isLoading || schemas.isFetching || entry.isFetching}
    >
      {entry.data && schemas.data ? (
        <JSONSchemaForm
          id={`entry-schema-${path.join("-")}`}
          saveLabel="Save Schema"
          value={entry.data.schema}
          onDirty={claimDirty}
          onValue={async (schema) => {
            await saveSchema.mutateAsync({ name: path[0], schema });
            releaseDirty();
            showToast("Schema has been updated.");
          }}
          schema={fullSchema}
          padded
        />
      ) : null}
    </FeaturePane>
  );
}

export const StoreEntriesSchemaFeature = memo(StoreEntriesSchema);
