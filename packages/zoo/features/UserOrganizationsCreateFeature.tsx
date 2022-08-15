import { useRequiredConnection } from "@zerve/client/Connection";
import { postZAction } from "@zerve/client/ServerCalls";
import { Title, useAsyncHandler } from "@zerve/zen";
import { memo } from "react";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import {
  UserDashboardContext,
  UserFeatureProps,
} from "../context/UserDashboardContext";
import { FeaturePane } from "../web/Dashboard";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { EmptySchemaStore } from "@zerve/core";
import { useFragmentNavigate } from "../web/Fragment";

const OrgNameSchema = {
  type: "string",
  title: "Organization Name",
} as const;

function UserOrganizationsCreate({ entityId, title }: UserFeatureProps) {
  const conn = useRequiredConnection();
  const queryClient = useQueryClient();
  const { push } = useRouter();
  const { handle, isLoading } = useAsyncHandler(async (value) => {
    await postZAction(conn, ["Auth", "user", "CreateOrg"], value);
    queryClient.invalidateQueries([conn.key, "z", "Auth", "user", "Orgs"]);
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
