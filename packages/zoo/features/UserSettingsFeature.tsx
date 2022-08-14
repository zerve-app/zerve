import { memo } from "react";
import { UserFeatureLink } from "../context/UserDashboardContext";
import { FeaturePane } from "../web/Dashboard";

function UserSettings({
  entityId,
  title,
}: {
  entityId: string;
  title: string;
}) {
  return (
    <FeaturePane title={title}>
      <UserFeatureLink
        title="Profile"
        to={{ key: "settings", child: "profile" }}
      />
      <UserFeatureLink title="Auth" to={{ key: "settings", child: "auth" }} />
    </FeaturePane>
  );
}
export const UserSettingsFeature = memo(UserSettings);
