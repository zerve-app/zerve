import { EmptySchemaStore, prepareStoreFileName } from "@zerve/zed";
import { memo, useCallback } from "react";
import { FeaturePane } from "../web/Dashboard";
import { useCreateEntry } from "@zerve/zoo-client/Mutation";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import { useStoreNavigation } from "../app/useNavigation";
import { JSONSchemaForm } from "@zerve/zen";

const EntryNameSchema = {
  type: "string",
  title: "Entry Name",
} as const;

function StoreEntriesCreate({ storePath, title }: StoreFeatureProps) {
  const createEntry = useCreateEntry(storePath);
  const { replaceToEntrySchema } = useStoreNavigation();
  const handleSubmit = useCallback(async (name) => {
    const actualName = prepareStoreFileName(name);
    await createEntry.mutateAsync(actualName);
    replaceToEntrySchema(actualName);
  }, []);
  return (
    <FeaturePane title={title} spinner={createEntry.isLoading}>
      <JSONSchemaForm
        id="entry-create-name"
        onSubmit={handleSubmit}
        schema={EntryNameSchema}
        schemaStore={EmptySchemaStore}
        saveLabel="Create Entry"
        padded
      />
    </FeaturePane>
  );
}

export const StoreEntriesCreateFeature = memo(StoreEntriesCreate);
