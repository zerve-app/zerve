import { useConnection } from "@zerve/client/Connection";
import { Title, VStack } from "@zerve/zen";
import { ComponentProps, createContext, memo } from "react";
import { LogoutButton } from "../components/Auth";
import { DashboardPage, FeaturePane, NavLink } from "./Dashboard";
import { FragmentContext } from "./Fragment";

export type UserNavigationState =
  | "stores"
  | "organizations"
  | {
      key: "settings";
      child?: "profile" | "auth";
    };

function UserFeatureLink(
  props: Omit<ComponentProps<typeof NavLink<UserNavigationState>>, "Context">
) {
  return (
    <NavLink<UserNavigationState> Context={UserDashboardContext} {...props} />
  );
}
function UserStoresFeature({
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

function UserOrganizationsFeature({
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

function UserSettingsFeatureUnpure({
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
const UserSettingsFeature = memo(UserSettingsFeatureUnpure);

function UserProfileSettingsFeature({
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

function UserAuthSettingsFeature({
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

const UserDashboardContext =
  createContext<null | FragmentContext<UserNavigationState>>(null);

export function UserDashboard({ entityId }: { entityId: string }) {
  const conn = useConnection();
  const session = conn?.session;
  return (
    <DashboardPage<UserNavigationState>
      Context={UserDashboardContext}
      navigation={["stores", "organizations", { key: "settings" }]}
      navigationFooter={
        <VStack padded>
          {session && <LogoutButton connection={conn} session={session} />}
        </VStack>
      }
      getFeatureTitle={(feature) => {
        if (feature === "stores") return "Stores";
        if (feature === "organizations") return "Organizations";
        if (feature?.key === "settings") {
          const settingsFeature = feature?.child;
          if (settingsFeature === "profile") return "User Profile";
          if (settingsFeature === "auth") return "Auth Settings";
          return "Settings";
        }
        return "?";
      }}
      getFeatureIcon={(feature) => {
        if (feature === "stores") return "folder-open";
        if (feature === "organizations") return "building";
        if (feature?.key === "settings") {
          const settingsFeature = feature?.child;
          if (settingsFeature === "profile") return "user";
          if (settingsFeature === "auth") return "lock";
          return "gear";
        }
        return null;
      }}
      renderFeature={({ feature, key, ...props }) => {
        if (feature === "organizations")
          return (
            <UserOrganizationsFeature
              key={key}
              entityId={entityId}
              {...props}
            />
          );
        if (feature === "stores")
          return <UserStoresFeature key={key} entityId={entityId} {...props} />;
        if (feature?.key === "settings") {
          const settingsFeature = feature?.child;
          if (settingsFeature === "profile")
            return (
              <UserProfileSettingsFeature
                key={key}
                entityId={entityId}
                {...props}
              />
            );
          if (settingsFeature === "auth")
            return (
              <UserAuthSettingsFeature
                key={key}
                entityId={entityId}
                {...props}
              />
            );
          return (
            <UserSettingsFeature key={key} entityId={entityId} {...props} />
          );
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
