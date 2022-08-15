import {
  StoreDashboardContext,
  StoreFeatureProps,
  StoreNavigationState,
} from "../context/StoreDashboardContext";
import { StoreEntriesCreateFeature } from "../features/StoreEntriesCreateFeature";
import { StoreEntriesFeature } from "../features/StoreEntriesFeature";
import { StoreSchemasCreateFeature } from "../features/StoreSchemasCreateFeature";
import { StoreSchemasFeature } from "../features/StoreSchemasFeature";
import { StoreSettingsFeature } from "../features/StoreSettingsFeature";
import { DashboardPage } from "./Dashboard";
import { OrgHeader, ProjectHeader, UserHeader } from "./DashboardHeader";

export function StoreDashboard({
  storeId,
  entityId,
  entityIsOrg,
}: {
  storeId: string;
  entityId: string;
  entityIsOrg: boolean;
}) {
  return (
    <DashboardPage<StoreNavigationState>
      Context={StoreDashboardContext}
      header={
        <>
          {entityIsOrg ? (
            <OrgHeader orgId={entityId} />
          ) : (
            <UserHeader userId={entityId} />
          )}
          <ProjectHeader entityId={entityId} storeId={storeId} />
        </>
      }
      navigation={[{ key: "entries" }, { key: "schemas" }, { key: "settings" }]}
      defaultFeature={{ key: "entries" }}
      getFeatureTitle={(feature: StoreNavigationState) => {
        if (feature.key === "settings") {
          return "Settings";
        }
        if (feature.key === "entries") {
          if (feature.child === "create") return "Create Entry";
          return "Entries";
        }
        if (feature.key === "schemas") {
          if (feature.child === "create") return "Create Schema";
          return "Schemas";
        }
        return "?";
      }}
      getFeatureIcon={(feature: StoreNavigationState) => {
        if (feature.key === "entries") {
          if (feature.child === "create") return "plus-circle";
          return "folder-open";
        }
        if (feature.key === "schemas") {
          if (feature.child === "create") return "plus-circle";
          return "crosshairs";
        }
        if (feature.key === "settings") {
          return "gear";
        }
        return null;
      }}
      renderFeature={({ feature, key, ...props }) => {
        const storeFeatureProps = {
          key,
          storePath: entityIsOrg
            ? ["Auth", "user", "Orgs", entityId, "Stores", storeId]
            : ["Auth", "user", "Stores", storeId],
          ...props,
        };
        if (feature?.key === "entries") {
          if (feature.child === "create") {
            return <StoreEntriesCreateFeature {...storeFeatureProps} />;
          }
          return <StoreEntriesFeature {...storeFeatureProps} />;
        }
        if (feature?.key === "schemas") {
          if (feature.child === "create") {
            return <StoreSchemasCreateFeature {...storeFeatureProps} />;
          }
          return <StoreSchemasFeature {...storeFeatureProps} />;
        }
        if (feature?.key === "settings") {
          return <StoreSettingsFeature {...storeFeatureProps} />;
        }
        return null;
      }}
      parseFeatureFragment={(fragment: string) => {
        if (fragment.startsWith("entries")) {
          const restFragment = fragment
            .split("entries")
            .slice(1)
            .join("entries");
          if (fragment.endsWith("__create")) {
            return { key: "entries", child: "create" };
          }
          return { key: "entries" };
        }
        if (fragment.startsWith("schemas")) {
          if (fragment.endsWith("__create"))
            return { key: "schemas", child: "create" };
          return { key: "schemas" };
        }
        if (fragment.startsWith("settings")) {
          return { key: "settings" };
        }

        if (fragment === "settings") return { key: "settings" };
        return null;
      }}
      stringifyFeatureFragment={(feature: StoreNavigationState) => {
        if (feature.key === "entries") {
          if (feature.child === "create") return "entries__create";
          let fragment = "entries";
          if (feature.path)
            feature.path.forEach(
              (entryPathTerm) => (fragment += `-${entryPathTerm}`)
            );
          return fragment;
        }
        if (feature.key === "schemas") {
          let fragment = "schemas";
          if (feature.child === "create") fragment += "__create";
          return fragment;
        }
        if (feature.key === "settings") {
          return "settings";
        }
        return "";
      }}
      getParentFeatures={(feature) => {
        if (feature.key === "entries" && feature.child) {
          return [{ key: "entries" }];
        }
        if (feature.key === "schemas" && feature.child) {
          return [{ key: "schemas" }];
        }
        return [];
      }}
    />
  );
}
