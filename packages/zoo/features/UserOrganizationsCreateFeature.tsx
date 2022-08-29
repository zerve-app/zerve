import { useRequiredConnection } from "@zerve/zoo-client/Connection";
import { postZAction } from "@zerve/zoo-client/ServerCalls";
import { JSONSchemaForm, Title, useAsyncHandler } from "@zerve/zen";
import { memo } from "react";
import { UserFeatureProps } from "../context/UserDashboardContext";
import { FeaturePane } from "../web/Dashboard";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { EmptySchemaStore } from "@zerve/zed";

const OrgNameSchema = {
  type: "string",
  title: "Organization Name",
} as const;

function UserOrganizationsCreate({ entityId, title }: UserFeatureProps) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const { push } = useRouter();
  const { handle, isLoading } = useAsyncHandler(async (value) => {
    await postZAction(conn, ["auth", "user", "CreateOrg"], value);
    queryClient.invalidateQueries([conn.key, "z", "auth", "user", "Orgs"]);
    push(`/${value}`);
  });
  return (
    <FeaturePane title={title} spinner={false}>
      <JSONSchemaForm
        id="org-create-name"
        onSubmit={handle}
        schema={OrgNameSchema}
        schemaStore={EmptySchemaStore}
        saveLabel="Create Organization"
        padded
      />
    </FeaturePane>
  );
}

export const UserOrganizationsCreateFeature = memo(UserOrganizationsCreate);
