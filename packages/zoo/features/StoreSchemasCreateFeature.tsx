import { useCreateSchema } from "@zerve/zoo-client/Mutation";
import { EmptySchemaStore, prepareStoreFileName } from "@zerve/zed";
import { memo, useCallback } from "react";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import { useStoreNavigation } from "../app/useStoreNavigation";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { JSONSchemaForm } from "@zerve/zen/JSONSchemaForm";

const SchemaNameSchema = {
  type: "string",
  title: "Schema Name",
} as const;

function StoreSchemasCreate({
  storePath,
  title,
  icon,
  isActive,
  onBack,
}: StoreFeatureProps) {
  const createSchema = useCreateSchema(storePath);
  const { replaceToSchema } = useStoreNavigation();
  const handleSubmit = useCallback(async (name) => {
    const actualName = prepareStoreFileName(name);
    await createSchema.mutateAsync(actualName);
    replaceToSchema(actualName);
  }, []);
  return (
    <FeaturePane
      title={title}
      icon={icon}
      onBack={onBack}
      isActive={isActive}
      spinner={createSchema.isLoading}
    >
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
