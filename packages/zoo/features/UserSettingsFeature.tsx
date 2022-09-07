import { memo } from "react";
import {
  UserFeatureLink,
  UserFeatureProps,
} from "../context/UserDashboardContext";
import { FeaturePane } from "../components/FeaturePane";

function UserSettings({ title }: UserFeatureProps) {
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
