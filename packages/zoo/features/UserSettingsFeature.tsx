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
        icon="user"
        to={{ key: "settings", child: "profile" }}
      />
      <UserFeatureLink
        title="Auth"
        icon="lock"
        to={{ key: "settings", child: "auth" }}
      />
    </FeaturePane>
  );
}
export const UserSettingsFeature = memo(UserSettings);
