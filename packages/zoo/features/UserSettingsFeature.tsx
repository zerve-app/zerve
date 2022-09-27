import { memo } from "react";
import {
  UserFeatureLink,
  UserFeatureProps,
} from "../context/UserDashboardContext";
import { NavLinkContentGroup } from "@zerve/zen/NavLink";
import { FeaturePane } from "@zerve/zen/FeaturePane";

function UserSettings({ title, icon, isActive }: UserFeatureProps) {
  return (
    <FeaturePane title={title} icon={icon} isActive={isActive}>
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
