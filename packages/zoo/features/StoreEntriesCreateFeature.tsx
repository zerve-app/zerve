import { useConnection, useRequiredConnection } from "@zerve/client/Connection";
import { postZAction } from "@zerve/client/ServerCalls";
import { EmptySchemaStore } from "@zerve/core";
import { Title, useAsyncHandler } from "@zerve/zen";
import { memo } from "react";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { FeaturePane } from "../web/Dashboard";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { useCreateFile } from "@zerve/client/Mutation";
import { StoreFeatureProps } from "../context/StoreDashboardContext";

const EntryNameSchema = {
  type: "string",
  title: "Entry Name",
} as const;

function StoreEntriesCreate({ entityId, title }: StoreFeatureProps) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const { push } = useRouter();
  // useCreateFile()

  const { handle, isLoading } = useAsyncHandler(async (value) => {
    await postZAction(conn, ["Auth", "user", "CreateStore"], value);
    queryClient.invalidateQueries([conn.key, "z", "Auth", "user", "Stores"]);
    push(`/${entityId}/${value}`);
  });
  return (
    <FeaturePane title={title} spinner={isLoading}>
      <JSONSchemaForm
        id="entry-create-name"
        onSubmit={handle}
        schema={EntryNameSchema}
        schemaStore={EmptySchemaStore}
        saveLabel="Create Entry"
        padded
      />
    </FeaturePane>
  );
}

export const StoreEntriesCreateFeature = memo(StoreEntriesCreate);
