import { memo } from "react";
import {
  UserFeatureLink,
  UserFeatureProps,
} from "../context/UserDashboardContext";
import { FeaturePane } from "../components/FeaturePane";
import { NavLinkContentGroup } from "@zerve/zen/NavLink";

function UserSettings({ title }: UserFeatureProps) {
  return (
    <FeaturePane title={title}>
      <NavLinkContentGroup>
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
      </NavLinkContentGroup>
    </FeaturePane>
  );
}
export const UserSettingsFeature = memo(UserSettings);
