import { useCreateSchema } from "@zerve/zoo-client/Mutation";
import { EmptySchemaStore, prepareStoreFileName } from "@zerve/zed";
import { JSONSchemaForm } from "@zerve/zen";
import { memo, useCallback } from "react";
import { useStoreNavigation } from "../app/useNavigation";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import { FeaturePane } from "../web/Dashboard";

const SchemaNameSchema = {
  type: "string",
  title: "Schema Name",
} as const;

function StoreSchemasCreate({ storePath, title }: StoreFeatureProps) {
  const createSchema = useCreateSchema(storePath);
  const { replaceToSchema } = useStoreNavigation();
  const handleSubmit = useCallback(async (name) => {
    const actualName = prepareStoreFileName(name);
    await createSchema.mutateAsync(actualName);
    replaceToSchema(actualName);
  }, []);
  return (
    <FeaturePane title={title} spinner={createSchema.isLoading}>
      <JSONSchemaForm
        id="schema-create-name"
        onSubmit={handleSubmit}
        schema={SchemaNameSchema}
        schemaStore={EmptySchemaStore}
        saveLabel="Create Schema"
        padded
      />
    </FeaturePane>
  );
}

export const StoreSchemasCreateFeature = memo(StoreSchemasCreate);
