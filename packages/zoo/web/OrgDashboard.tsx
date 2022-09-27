import { NavBarSpacer } from "@zerve/zen/NavBar";
import { AuthHeader } from "../components/AuthHeader";
import {
  OrgDashboardContext,
  OrgNavigationState,
} from "../context/OrgDashboardContext";
import { DashboardZFeature } from "../features/DashboardZFeature";
import { OrgStoresCreateFeature } from "../features/OrgStoresCreateFeature";
import { OrgStoresFeature } from "../features/OrgStoresFeature";
import { DashboardPage } from "./Dashboard";
import { OrgHeader } from "./DashboardHeader";

export function OrgDashboard({ entityId }: { entityId: string }) {
  return (
    <DashboardPage<OrgNavigationState>
      Context={OrgDashboardContext}
      header={
        <>
          <OrgHeader orgId={entityId} />
          <NavBarSpacer />
          <AuthHeader />
        </>
      }
      navigation={[{ key: "stores" }, { key: "members" }, { key: "settings" }]}
      defaultFeature={{ key: "stores" }}
      navigationFooter={null}
      getFeatureTitle={(feature) => {
        if (feature?.key === "stores") {
          if (feature?.child === "create") return "Create Store";
          return "Stores";
        }
        if (feature?.key === "members") {
          if (feature?.child === "invite") return "Invite Member";
          return "Members";
        }
        if (feature?.key === "settings") {
          return "Settings";
        }
        return "?";
      }}
      getFeatureIcon={(feature) => {
        if (feature?.key === "stores") {
          if (feature?.child === "create") return "plus-circle";
          return "folder-open";
        }
        if (feature?.key === "members") {
          if (feature?.child === "invite") return "plus-circle";
          return "group";
        }
        if (feature?.key === "settings") {
          return "gear";
        }
        return null;
      }}
      renderFeature={({ feature, key, ...props }) => {
        const orgFeatureProps = {
          key,
          entityId,
          ...props,
        };
        if (feature?.key === "stores") {
          if (feature?.child === "create")
            return <OrgStoresCreateFeature {...orgFeatureProps} />;
          return <OrgStoresFeature {...orgFeatureProps} />;
        }
        if (feature?.key === "members") {
          return (
            <DashboardZFeature
              path={["auth", "user", "orgs", entityId, "members"]}
              {...orgFeatureProps}
            />
          );
        }
        if (feature?.key === "settings") {
          return (
            <DashboardZFeature
              path={["auth", "user", "orgs", entityId, "org-settings"]}
              {...orgFeatureProps}
            />
          );
        }
        return null;
      }}
      parseFeatureFragment={(fragment: string) => {
        if (fragment === "stores") return { key: "stores" };
        if (fragment === "stores_create")
          return { key: "stores", child: "create" };
        if (fragment === "members") return { key: "members" };
        if (fragment === "members_invite")
          return { key: "members", child: "invite" };
        if (fragment === "settings") return { key: "settings" };
        return null;
      }}
      stringifyFeatureFragment={(feature: OrgNavigationState) => {
        if (feature?.key === "stores") {
          const child = feature?.child;
          if (child === "create") return "stores_create";
          return "stores";
        }
        if (feature?.key === "members") {
          const child = feature?.child;
          if (child === "invite") return "members_invite";
          return "members";
        }
        if (feature?.key === "settings") {
          return "settings";
        }
        return "";
      }}
      getParentFeatures={(feature: OrgNavigationState) => {
        if (typeof feature === "object" && !!feature?.child) {
          return [{ key: feature.key }];
        }
        return [];
      }}
    />
  );
}
