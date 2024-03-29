import { useRequiredConnection } from "@zerve/zoo-client/Connection";
import { postZAction } from "@zerve/zoo-client/ServerCalls";
import { EmptySchemaStore, IDSchema } from "@zerve/zed";
import { memo } from "react";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { OrgFeatureProps } from "../context/OrgDashboardContext";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { JSONSchemaForm } from "@zerve/zen/JSONSchemaForm";
import { useAsyncHandler } from "@zerve/zen/useAsyncHandler";

const StoreNameSchema = {
  ...IDSchema,
  title: "Store Name",
} as const;

function OrgStoresCreate({ entityId, title, icon, isActive }: OrgFeatureProps) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const { push } = useRouter();
  const { handle, isLoading } = useAsyncHandler(async (value) => {
    await postZAction(
      conn,
      ["auth", "user", "orgs", entityId, "createStore"],
      value,
    );
    queryClient.invalidateQueries([
      conn.key,
      "z",
      "auth",
      "user",
      "orgs",
      entityId,
      "stores",
    ]);
    push(`/${entityId}/${value}`);
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

export const OrgStoresCreateFeature = memo(OrgStoresCreate);
