import { Title } from "@zerve/zen";
import { memo } from "react";
import { UserFeatureProps } from "../context/UserDashboardContext";
import { FeaturePane } from "../web/Dashboard";

function UserOrganizationsCreate({ entityId, title }: UserFeatureProps) {
  return (
    <FeaturePane title={title} spinner={false}>
      <Title title={"soon"} />
    </FeaturePane>
  );
}

export const UserOrganizationsCreateFeature = memo(UserOrganizationsCreate);
