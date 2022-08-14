import { Title } from "@zerve/zen";
import { memo } from "react";
import { FeaturePane } from "../web/Dashboard";

function UserSettingsAuth({
  entityId,
  title,
}: {
  entityId: string;
  title: string;
}) {
  return (
    <FeaturePane title={title}>
      <Title title={entityId} />
    </FeaturePane>
  );
}
export const UserSettingsAuthFeature = memo(UserSettingsAuth);
