import { useConnection } from "@zerve/zoo-client/Connection";
import { VStack } from "@zerve/zen";
import { LogoutButton } from "../components/Auth";
import {
  UserDashboardContext,
  UserNavigationState,
} from "../context/UserDashboardContext";
import { UserOrganizationsCreateFeature } from "../features/UserOrganizationsCreateFeature";
import { UserOrganizationsFeature } from "../features/UserOrganizationsFeature";
import { UserSettingsAuthFeature } from "../features/UserSettingsAuthFeature";
import { UserSettingsFeature } from "../features/UserSettingsFeature";
import { UserSettingsProfileFeature } from "../features/UserSettingsProfileFeature";
import { UserStoresCreateFeature } from "../features/UserStoresCreateFeature";
import { UserStoresFeature } from "../features/UserStoresFeature";
import { DashboardPage, FeaturePane } from "./Dashboard";
import { UserHeader } from "./DashboardHeader";
import { useRouter } from "next/router";

export function UserDashboard({ entityId }: { entityId: string }) {
  const conn = useConnection();
  const { push } = useRouter();
  const session = conn?.session;
  return (
    <DashboardPage<UserNavigationState>
      Context={UserDashboardContext}
      header={<UserHeader userId={entityId} />}
      navigation={[
        { key: "stores" },
        { key: "organizations" },
        { key: "settings" },
      ]}
      defaultFeature={{ key: "stores" }}
      navigationFooter={
        <VStack padded>
          {session && (
            <LogoutButton
              connection={conn}
              session={session}
              onComplete={() => {
                // experienced a race condition where the login window pops up again. this hack aims to avoid that:
                setTimeout(() => push("/"), 100);
              }}
            />
          )}
        </VStack>
      }
      getFeatureTitle={(feature) => {
        if (feature?.key === "organizations") {
          if (feature?.child === "create") return "Create Organization";
          return "Organizations";
        }
        if (feature?.key === "stores") {
          if (feature?.child === "create") return "Create Store";
          return "Personal Stores";
        }
        if (feature?.key === "settings") {
          const settingsFeature = feature?.child;
          if (settingsFeature === "profile") return "User Profile";
          if (settingsFeature === "auth") return "Auth Settings";
          return "Account Settings";
        }
        return "?";
      }}
      getFeatureIcon={(feature) => {
        if (feature?.key === "organizations") {
          if (feature?.child === "create") return "plus-circle";
          return "building";
        }
        if (feature?.key === "stores") {
          if (feature?.child === "create") return "plus-circle";
          return "folder-open";
        }
        if (feature?.key === "settings") {
          const settingsFeature = feature?.child;
          if (settingsFeature === "profile") return "user";
          if (settingsFeature === "auth") return "lock";
          return "gear";
        }
        return null;
      }}
      renderFeature={({ feature, key, ...props }) => {
        const userFeatureProps = {
          key,
          entityId,
          ...props,
        };
        if (feature?.key === "organizations") {
          if (feature?.child === "create")
            return <UserOrganizationsCreateFeature {...userFeatureProps} />;
          return <UserOrganizationsFeature {...userFeatureProps} />;
        }
        if (feature?.key === "stores") {
          if (feature?.child === "create")
            return <UserStoresCreateFeature {...userFeatureProps} />;
          return <UserStoresFeature {...userFeatureProps} />;
        }
        if (feature?.key === "settings") {
          const settingsFeature = feature?.child;
          if (settingsFeature === "profile")
            return <UserSettingsProfileFeature {...userFeatureProps} />;
          if (settingsFeature === "auth")
            return <UserSettingsAuthFeature {...userFeatureProps} />;
          return <UserSettingsFeature {...userFeatureProps} />;
        }
        return null;
      }}
      parseFeatureFragment={(fragment: string) => {
        if (fragment === "stores") return { key: "stores" };
        if (fragment === "stores_create")
          return { key: "stores", child: "create" };
        if (fragment === "organizations") return { key: "organizations" };
        if (fragment === "organizations_create")
          return { key: "organizations", child: "create" };
        if (fragment === "settings") return { key: "settings" };
        if (fragment === "settings_profile")
          return { key: "settings", child: "profile" };
        if (fragment === "settings_auth")
          return { key: "settings", child: "auth" };
        return null;
      }}
      stringifyFeatureFragment={(feature: UserNavigationState) => {
        const child = feature?.child;
        if (feature?.key === "organizations") {
          if (child === "create") return "organizations_create";
          return "organizations";
        }
        if (feature?.key === "stores") {
          if (child === "create") return "stores_create";
          return "stores";
        }
        if (feature?.key === "settings") {
          if (child === "profile") return "settings_profile";
          if (child === "auth") return "settings_auth";
          return "settings";
        }
        return "";
      }}
      getParentFeatures={(feature: UserNavigationState) => {
        if (typeof feature === "object" && !!feature?.child) {
          return [{ key: feature.key }];
        }
        return [];
      }}
    />
  );
}
