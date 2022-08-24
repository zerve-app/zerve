import { showToast, JSONSchemaForm, JSONSchemaEditorContext } from "@zerve/zen";
import React, { memo, useMemo } from "react";
import { FeaturePane } from "../web/Dashboard";
import { useSaveSchema } from "@zerve/client/Mutation";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import { useZNodeValue, useZStoreJSONSchema } from "@zerve/client/Query";

const overrideSchemaImportContext = {} as const;

function StoreSchemasSchema({
  storePath,
  location,
  schema: schemaName,
  title,
}: StoreFeatureProps & { schema: string }) {
  const schemas = useZStoreJSONSchema(storePath);
  const schemaQuery = useZNodeValue([
    ...storePath,
    "State",
    "$schemas",
    schemaName,
  ]);
  const schemasExcludingSelf = useMemo(() => {
    const allSchemaOptions = schemas?.data?.oneOf;
    if (!allSchemaOptions) return undefined;
    const thisSchemaId = `https://type.zerve.link/${schemaName}`;
    return {
      oneOf: allSchemaOptions.filter((schema) => schema?.$id !== thisSchemaId),
    };
  }, [schemas?.data, schemaName]);
  const saveSchema = useSaveSchema(storePath);
  return (
    <FeaturePane
      title={title}
      spinner={
        saveSchema.isLoading || schemas.isFetching || schemaQuery.isFetching
      }
    >
      {schemaQuery.data && schemasExcludingSelf ? (
        <JSONSchemaEditorContext.Provider value={overrideSchemaImportContext}>
          <JSONSchemaForm
            id={`file-schema-${schemaName}`}
            saveLabel="Save Schema"
            saveIcon="check-circle"
            value={schemaQuery.data}
            onValue={async (schemaValue) => {
              await saveSchema.mutateAsync({
                schemaName,
                schema: schemaValue,
              });
              showToast("Schema has been updated.");
            }}
            schema={schemasExcludingSelf}
            // schemaStore={storeSchemas}
            padded
          />
        </JSONSchemaEditorContext.Provider>
      ) : null}
    </FeaturePane>
  );
}

export const StoreSchemasSchemaFeature = memo(StoreSchemasSchema);
