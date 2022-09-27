import { useRequiredConnection } from "@zerve/zoo-client/Connection";
import { postZAction } from "@zerve/zoo-client/ServerCalls";
import { EmptySchemaStore, IDSchema } from "@zerve/zed";
import { memo } from "react";
import { UserFeatureProps } from "../context/UserDashboardContext";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { useAsyncHandler } from "@zerve/zen/useAsyncHandler";
import { showToast } from "@zerve/zen/Toast";
import { JSONSchemaForm } from "@zerve/zen/JSONSchemaForm";

const StoreNameSchema = {
  ...IDSchema,
  title: "Store Name",
} as const;

function UserStoresCreate({
  entityId,
  title,
  icon,
  isActive,
}: UserFeatureProps) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const { push } = useRouter();
  const { handle, isLoading } = useAsyncHandler(async (value) => {
    await postZAction(conn, ["auth", "user", "createStore"], value);
    queryClient.invalidateQueries([conn.key, "z", "auth", "user", "stores"]);
    push(`/${entityId}/${value}`);
    showToast(`Created "${value}" Store`);
  });
  return (
    <FeaturePane
      title={title}
      icon={icon}
      isActive={isActive}
      spinner={isLoading}
    >
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
