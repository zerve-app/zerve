import { useConnection, useRequiredConnection } from "@zerve/client/Connection";
import { postZAction } from "@zerve/client/ServerCalls";
import { EmptySchemaStore } from "@zerve/core";
import { JSONSchemaForm, Title, useAsyncHandler } from "@zerve/zen";
import { memo } from "react";
import { UserFeatureProps } from "../context/UserDashboardContext";
import { FeaturePane } from "../web/Dashboard";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";

const StoreNameSchema = {
  type: "string",
  title: "Store Name",
} as const;

function UserStoresCreate({ entityId, title }: UserFeatureProps) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const { push } = useRouter();
  const { handle, isLoading } = useAsyncHandler(async (value) => {
    await postZAction(conn, ["Auth", "user", "CreateStore"], value);
    queryClient.invalidateQueries([conn.key, "z", "Auth", "user", "Stores"]);
    push(`/${entityId}/${value}`);
  });
  return (
    <FeaturePane title={title} spinner={isLoading}>
      <JSONSchemaForm
        id="store-create-name"
        onSubmit={handle}
        schema={StoreNameSchema}
        schemaStore={EmptySchemaStore}
        saveLabel="Create Store"
        padded
      />
    </FeaturePane>
  );
}

export const UserStoresCreateFeature = memo(UserStoresCreate);
