import {
  useConnection,
  useRequiredConnection,
} from "@zerve/zoo-client/Connection";
import { postZAction } from "@zerve/zoo-client/ServerCalls";
import { EmptySchemaStore, IDSchema } from "@zerve/zed";
import { JSONSchemaForm, showToast, Title, useAsyncHandler } from "@zerve/zen";
import { memo } from "react";
import { UserFeatureProps } from "../context/UserDashboardContext";
import { FeaturePane } from "../web/Dashboard";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";

const StoreNameSchema = {
  ...IDSchema,
  title: "Store Name",
} as const;

function UserStoresCreate({ entityId, title }: UserFeatureProps) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const { push } = useRouter();
  const { handle, isLoading } = useAsyncHandler(async (value) => {
    await postZAction(conn, ["auth", "user", "CreateStore"], value);
    queryClient.invalidateQueries([conn.key, "z", "auth", "user", "stores"]);
    push(`/${entityId}/${value}`);
    showToast(`Created "${value}" Store`);
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
