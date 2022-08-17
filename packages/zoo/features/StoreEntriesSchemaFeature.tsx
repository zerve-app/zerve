import { useConnection, useRequiredConnection } from "@zerve/client/Connection";
import { postZAction } from "@zerve/client/ServerCalls";
import { EmptySchemaStore, prepareStoreFileName } from "@zerve/core";
import { showToast, Title, useAsyncHandler } from "@zerve/zen";
import { memo, useCallback, useMemo } from "react";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { FeaturePane, NavLink } from "../web/Dashboard";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";
import {
  useCreateEntry,
  useSaveEntry,
  useSaveEntrySchema,
} from "@zerve/client/Mutation";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import { useStoreNavigation } from "../app/useNavigation";
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
          onValue={async (schema) => {
            await saveSchema.mutateAsync({ name: path[0], schema });
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
