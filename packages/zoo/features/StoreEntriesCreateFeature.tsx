import { EmptySchemaStore, prepareStoreFileName } from "@zerve/zed";
import { memo, useCallback } from "react";
import { FeaturePane } from "../components/FeaturePane";
import { useCreateEntry } from "@zerve/zoo-client/Mutation";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import { JSONSchemaForm, showToast } from "@zerve/zen";
import { useStoreNavigation } from "../app/useStoreNavigation";

const EntryNameSchema = {
  type: "string",
  title: "Entry Name",
} as const;

function StoreEntriesCreate({
  storePath,
  title,
  icon,
  onBack,
}: StoreFeatureProps) {
  const createEntry = useCreateEntry(storePath);
  const { replaceToEntrySchema } = useStoreNavigation();
  const handleSubmit = useCallback(async (name) => {
    const actualName = prepareStoreFileName(name);
    await createEntry.mutateAsync(actualName);
    showToast(`Created "${name}"`);
    replaceToEntrySchema(actualName);
  }, []);
  return (
    <FeaturePane
      title={title}
      icon={icon}
      onBack={onBack}
      spinner={createEntry.isLoading}
    >
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
