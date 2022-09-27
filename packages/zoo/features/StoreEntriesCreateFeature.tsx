import { EmptySchemaStore, prepareStoreFileName } from "@zerve/zed";
import { memo, useCallback } from "react";
import { useCreateEntry } from "@zerve/zoo-client/Mutation";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import { useStoreNavigation } from "../app/useStoreNavigation";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { showToast } from "@zerve/zen/Toast";
import { JSONSchemaForm } from "@zerve/zen/JSONSchemaForm";

const EntryNameSchema = {
  type: "string",
  title: "Entry Name",
} as const;

function StoreEntriesCreate({
  storePath,
  title,
  isActive,
  icon,
  onBack,
}: StoreFeatureProps) {
  const createEntry = useCreateEntry(storePath);
  const { replaceToEntry } = useStoreNavigation();
  const handleSubmit = useCallback(async (name) => {
    const actualName = prepareStoreFileName(name);
    await createEntry.mutateAsync(actualName);
    showToast(`Created "${name}"`);
    replaceToEntry(actualName);
  }, []);
  return (
    <FeaturePane
      title={title}
      icon={icon}
      isActive={isActive}
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
