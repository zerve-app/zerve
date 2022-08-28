import { useRequiredConnection } from "@zerve/client/Connection";
import { postZAction } from "@zerve/client/ServerCalls";
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
      ["Auth", "user", "Orgs", entityId, "CreateStore"],
      value,
    );
    queryClient.invalidateQueries([
      conn.key,
      "z",
      "Auth",
      "user",
      "Orgs",
      entityId,
      "Stores",
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
