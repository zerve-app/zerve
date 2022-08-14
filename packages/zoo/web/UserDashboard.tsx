import { Paragraph, Title } from "@zerve/zen";
import { ComponentProps, createContext } from "react";
import { DashboardPage, FeaturePane, NavLink } from "./Dashboard";
import { FragmentContext, FragmentLink } from "./Fragment";

export type UserNavigationState =
  | "stores"
  | "organizations"
  | {
      key: "settings";
      child?: "profile" | "auth";
    };

function UserStoresFeature({ entityId }: { entityId: string }) {
  return (
    <FeaturePane title="Stores">
      <Title title={entityId} />
    </FeaturePane>
  );
}

function UserOrganizationsFeature({ entityId }: { entityId: string }) {
  return (
    <FeaturePane title="Organizations">
      <Title title={entityId} />
    </FeaturePane>
  );
}

function UserFeatureLink(
  props: Omit<ComponentProps<typeof NavLink<UserNavigationState>>, "Context">
) {
  return (
    <NavLink<UserNavigationState> Context={UserDashboardContext} {...props} />
  );
}

function UserSettingsFeature({ entityId }: { entityId: string }) {
  return (
    <FeaturePane title="Settings">
      <UserFeatureLink title="Organizations" to="organizations" />
      <UserFeatureLink
        title="Profile"
        to={{ key: "settings", child: "profile" }}
      />
      <UserFeatureLink title="Auth" to={{ key: "settings", child: "auth" }} />
    </FeaturePane>
  );
}

function UserProfileSettingsFeature({ entityId }: { entityId: string }) {
  return (
    <FeaturePane title="Profile Settings">
      <Title title={entityId} />
    </FeaturePane>
  );
}

function UserAuthSettingsFeature({ entityId }: { entityId: string }) {
  return (
    <FeaturePane title="Auth Settings">
      <Title title={entityId} />
    </FeaturePane>
  );
}

const UserDashboardContext =
  createContext<null | FragmentContext<UserNavigationState>>(null);

export function UserDashboard({ entityId }: { entityId: string }) {
  return (
    <DashboardPage<UserNavigationState>
      Context={UserDashboardContext}
      navigation={[
        { title: "Stores", state: "stores" },
        { title: "Organizations", state: "organizations" },
        { title: "Settings", state: { key: "settings" } },
      ]}
      renderFeature={({ feature, key, ...props }) => {
        if (feature === "organizations")
          return <UserOrganizationsFeature key={key} entityId={entityId} />;
        if (feature === "stores")
          return <UserStoresFeature key={key} entityId={entityId} />;
        if (feature?.key === "settings") {
          const settingsFeature = feature?.child;
          if (settingsFeature === "profile")
            return <UserProfileSettingsFeature key={key} entityId={entityId} />;
          if (settingsFeature === "auth")
            return <UserAuthSettingsFeature key={key} entityId={entityId} />;
          return <UserSettingsFeature key={key} entityId={entityId} />;
        }
        return null;
      }}
      parseFeatureFragment={(fragment: string) => {
        if (fragment === "stores") return "stores";
        if (fragment === "organizations") return "organizations";
        if (fragment === "settings") return { key: "settings" };
        if (fragment === "settings/profile")
          return { key: "settings", child: "profile" };
        if (fragment === "settings/auth")
          return { key: "settings", child: "auth" };
        return null;
      }}
      stringifyFeatureFragment={(feature: UserNavigationState) => {
        if (feature === "stores") return "stores";
        if (feature === "organizations") return "organizations";
        if (feature?.key === "settings") {
          const settingsFeature = feature?.child;
          if (settingsFeature === "profile") return "settings/profile";
          if (settingsFeature === "auth") return "settings/auth";
          return "settings";
        }
        return "";
      }}
      getParentFeatures={(feature: UserNavigationState) => {
        if (
          typeof feature === "object" &&
          feature.key === "settings" &&
          feature.child
        ) {
          return [{ key: "settings" }];
        }
        return [];
      }}
    />
  );
}
