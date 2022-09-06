import { useRequiredConnection } from "@zerve/zoo-client/Connection";
import { postZAction } from "@zerve/zoo-client/ServerCalls";
import { EmptySchemaStore, IDSchema } from "@zerve/zed";
import { JSONSchemaForm, useAsyncHandler } from "@zerve/zen";
import { memo } from "react";
import { FeaturePane } from "../web/Dashboard";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { OrgFeatureProps } from "../context/OrgDashboardContext";

const StoreNameSchema = {
  ...IDSchema,
  title: "Store Name",
} as const;

function OrgStoresCreate({ entityId, title }: OrgFeatureProps) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const { push } = useRouter();
  const { handle, isLoading } = useAsyncHandler(async (value) => {
    await postZAction(
      conn,
      ["auth", "user", "orgs", entityId, "CreateStore"],
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

export const OrgStoresCreateFeature = memo(OrgStoresCreate);
