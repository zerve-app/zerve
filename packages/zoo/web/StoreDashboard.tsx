import { displayStoreFileName } from "@zerve/core";
import { useEffect, useMemo, useRef } from "react";
import {
  StoreDashboardContext,
  StoreNavigationState,
  UnsavedContext,
} from "../context/StoreDashboardContext";
import { StoreEntriesCreateFeature } from "../features/StoreEntriesCreateFeature";
import { StoreEntriesEntryFeature } from "../features/StoreEntriesEntryFeature";
import { StoreEntriesFeature } from "../features/StoreEntriesFeature";
import { StoreEntriesSchemaFeature } from "../features/StoreEntriesSchemaFeature";
import { StoreSchemasCreateFeature } from "../features/StoreSchemasCreateFeature";
import { StoreSchemasFeature } from "../features/StoreSchemasFeature";
import { StoreSchemasSchemaFeature } from "../features/StoreSchemasSchemaFeature";
import { StoreSettingsFeature } from "../features/StoreSettingsFeature";
import { DashboardPage } from "./Dashboard";
import { OrgHeader, ProjectHeader, UserHeader } from "./DashboardHeader";
import { useRouter } from "next/router";
import { NavigateInterceptContext, useModal } from "@zerve/zen";
import { Dialog } from "@zerve/zen/Dialog";

export function StoreDashboard({
  storeId,
  entityId,
  entityIsOrg,
}: {
  storeId: string;
  entityId: string;
  entityIsOrg: boolean;
}) {
  const { beforePopState, push } = useRouter();
  const dirtyRef = useRef(false);
  const latestFeatureRef = useRef<null | string>(null);
  const openModal = useModal<() => void>(
    ({ onClose, options: discardChangesAndNavigate }) => (
      <Dialog
        onClose={onClose}
        title="Discard Unsaved Changes?"
        danger
        confirmLabel="Discard Changes"
        closeLabel="Cancel"
        onConfirm={async () => {
          onClose();
          discardChangesAndNavigate();
        }}
      />
    ),
  );
  const unsavedEnvironment = useMemo(() => {
    return {
      releaseDirty: () => {
        window.onbeforeunload = null;
        dirtyRef.current = false;
      },
      claimDirty: () => {
        dirtyRef.current = true;
      },
    };
  }, []);
  useEffect(() => {
    window.onbeforeunload = (e) => {
      if (dirtyRef.current) {
        return "Unsaved changes will be lost.";
      }
      return undefined;
    };
  }, []);
  useEffect(() => {
    beforePopState((state) => {
      if (dirtyRef.current) {
        window.history.pushState(
          { pushId: Date.now() }, // maybe this is not needed?
          "unused",
          `?_=${latestFeatureRef.current}`,
        );
        openModal(() => {
          dirtyRef.current = false;
          push(state.as);
        });
        return false;
      }
      return true;
    });
  }, []);
  const navigateInterrupt = useMemo(() => {
    return (href: string) => {
      if (dirtyRef.current) {
        openModal(() => {
          dirtyRef.current = false;
          push(href);
        });
        return false;
      } else {
        return true;
      }
    };
  }, []);
  return (
    <UnsavedContext.Provider value={unsavedEnvironment}>
      <NavigateInterceptContext.Provider value={navigateInterrupt}>
        <DashboardPage<StoreNavigationState>
          Context={StoreDashboardContext}
          onIntercept={(
            feature: StoreNavigationState,
            navigateFeature: (feature: StoreNavigationState) => void,
          ) => {
            if (dirtyRef.current) {
              openModal(() => {
                dirtyRef.current = false;
                navigateFeature(feature);
              });
              return false;
            }
            return true;
          }}
          onFeature={(feature, featureString) => {
            latestFeatureRef.current = featureString;
          }}
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
          navigation={[
            { key: "entries" },
            { key: "schemas" },
            { key: "settings" },
          ]}
          defaultFeature={{ key: "entries" }}
          getFeatureTitle={(feature: StoreNavigationState) => {
            if (feature.key === "settings") {
              return "Store Settings";
            }
            if (feature.key === "entries") {
              if (feature.child === "create") return "Create Entry";
              if (feature.path?.length) {
                const nodeName = feature.path.at(-1) as string;
                if (feature.child === "schema") {
                  return `Schema: ${displayStoreFileName(nodeName)}`;
                }
                return displayStoreFileName(nodeName);
              }
              return "Entries";
            }
            if (feature.key === "schemas") {
              if (feature.child === "create") return "Create Schema";
              if (feature.schema) {
                return `Schema: ${displayStoreFileName(feature.schema)}`;
              }
              return "Schemas";
            }
            return "?";
          }}
          getFeatureIcon={(feature: StoreNavigationState) => {
            if (feature.key === "entries") {
              if (feature.child === "create") return "plus-circle";
              if (feature.child === "schema") return "crosshairs";
              if (feature.path?.length) return "file";
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
              location: [entityId, storeId],
              storeId,
              storePath: entityIsOrg
                ? ["Auth", "user", "Orgs", entityId, "Stores", storeId]
                : ["Auth", "user", "Stores", storeId],
              ...props,
            };
            if (feature?.key === "entries") {
              if (feature.child === "create") {
                return <StoreEntriesCreateFeature {...storeFeatureProps} />;
              }
              if (feature.path?.length) {
                if (feature.child === "schema") {
                  return (
                    <StoreEntriesSchemaFeature
                      {...storeFeatureProps}
                      path={feature.path}
                    />
                  );
                }
                return (
                  <StoreEntriesEntryFeature
                    {...storeFeatureProps}
                    path={feature.path}
                  />
                );
              }
              return <StoreEntriesFeature {...storeFeatureProps} />;
            }
            if (feature?.key === "schemas") {
              if (feature.child === "create") {
                return <StoreSchemasCreateFeature {...storeFeatureProps} />;
              }
              if (feature.schema) {
                return (
                  <StoreSchemasSchemaFeature
                    {...storeFeatureProps}
                    schema={feature.schema}
                  />
                );
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

              if (restFragment === "_create") {
                return { key: "entries", child: "create" };
              }
              if (restFragment.endsWith("_schema")) {
                const pathFragment = restFragment.slice(0, -7);
                const entryPath = pathFragment
                  .slice(1)
                  .split("-")
                  .filter((s) => s !== "");
                return { key: "entries", path: entryPath, child: "schema" };
              }
              const entryPath = restFragment
                .slice(1)
                .split("-")
                .filter((s) => s !== "");
              return { key: "entries", path: entryPath };
            }
            if (fragment.startsWith("schemas")) {
              if (fragment.endsWith("_create"))
                return { key: "schemas", child: "create" };
              const restFragment = fragment
                .split("schemas")
                .slice(1)
                .join("schemas");
              const schemaPath = restFragment
                .slice(1)
                .split("-")
                .filter((s) => s !== "");
              if (schemaPath.length) {
                return { key: "schemas", schema: schemaPath[0] };
              }
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
              if (feature.child === "create") return "entries_create";
              let fragment = "entries";
              if (feature.path)
                feature.path.forEach(
                  (entryPathTerm) => (fragment += `-${entryPathTerm}`),
                );
              if (feature.child === "schema") {
                fragment += "_schema";
              }
              return fragment;
            }
            if (feature.key === "schemas") {
              let fragment = "schemas";
              if (feature.child === "create") fragment += "_create";
              if (feature.schema) fragment += `-${feature.schema}`;
              return fragment;
            }
            if (feature.key === "settings") {
              return "settings";
            }
            return "";
          }}
          getParentFeatures={(feature) => {
            if (feature.key === "entries" && feature.path?.length) {
              const pathContext =
                feature.child === "schema"
                  ? feature.path
                  : feature.path.slice(0, -1);
              return [
                { key: "entries" },
                ...pathContext.map((path, index) => {
                  return {
                    key: "entries",
                    path: feature.path?.slice(0, index + 1) as string[],
                  } as const;
                }),
              ];
            }
            if (feature.key === "entries" && feature.child) {
              return [{ key: "entries" }];
            }
            if (
              feature.key === "schemas" &&
              (feature.child || feature.schema)
            ) {
              return [{ key: "schemas" }];
            }
            return [];
          }}
        />
      </NavigateInterceptContext.Provider>
    </UnsavedContext.Provider>
  );
}
