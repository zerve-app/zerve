import { displayStoreFileName, mergeValue } from "@zerve/core";
import { useEffect, useMemo, useRef, useState } from "react";
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

function parseFeatureFragment(fragment: string): null | StoreNavigationState {
  if (fragment.startsWith("entries")) {
    const restFragment = fragment.split("entries").slice(1).join("entries");
    if (restFragment === "--create") {
      return { key: "entries", child: "create" };
    }
    if (restFragment === "") {
      return { key: "entries" };
    }
    const schemasPath = restFragment.split("--schema");
    if (schemasPath.length >= 2) {
      const entryNameRestPath = schemasPath[0].split("-");
      const entryName = entryNameRestPath[1];
      const schemasRestPath = schemasPath[1].split("-");
      const path = schemasRestPath.slice(1);
      return { key: "entries", entryName, child: "schema", path };
    } else {
      const restPath = restFragment.split("-");
      const entryName = restPath[1];
      const path = restPath.slice(2);
      return { key: "entries", entryName, path };
    }
  }
  if (fragment.startsWith("schemas")) {
    if (fragment.endsWith("--create"))
      return { key: "schemas", child: "create" };
    const restFragment = fragment.split("schemas").slice(1).join("schemas");
    const schemaPath = restFragment
      .slice(1)
      .split("-")
      .filter((s) => s !== "");
    if (schemaPath.length) {
      return {
        key: "schemas",
        schema: schemaPath[0],
        path: schemaPath.slice(1),
      };
    }
    return { key: "schemas" };
  }
  if (fragment.startsWith("settings")) {
    return { key: "settings" };
  }

  if (fragment === "settings") return { key: "settings" };
  return null;
}

function allowedToNavigateToFeature(
  feature: StoreNavigationState,
  currentDirtyIds: Set<string>,
) {
  if (feature.key === "entries" && feature.child === "schema") {
    const destDirtyId = `entry-schema-${feature.entryName}`;
    if (currentDirtyIds.size === 1 && currentDirtyIds.has(destDirtyId)) {
      return true;
    }
  }
  if (feature.key === "entries") {
    const destDirtyId = `entry-${feature.entryName}`;
    if (currentDirtyIds.size === 1 && currentDirtyIds.has(destDirtyId)) {
      if (!feature.child) return true;
    }
  }
  if (feature.key === "schemas") {
    const destDirtyId = `schema-${feature.schema}`;
    debugger;
    if (currentDirtyIds.size === 1 && currentDirtyIds.has(destDirtyId)) {
      return true;
    }
  }
  return false;
}

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
  const dirtyIdsRef = useRef<Set<string>>(new Set());
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
  const dirtyValues = useMemo(() => new Map<string, any>(), []);
  const [dirtyIds, setDirtyIds] = useState(new Set<string>());
  const unsavedCtx = useMemo(() => {
    return {
      releaseDirty: (id: string) => {
        dirtyValues.delete(id);
        const newDirtyIds = new Set(dirtyIdsRef.current);
        newDirtyIds.delete(id);
        setDirtyIds(newDirtyIds);
        dirtyIdsRef.current = newDirtyIds;
      },
      claimDirty: (id: string, path: string[], value: any) => {
        if (dirtyIds.has(id)) {
          dirtyValues.set(id, mergeValue(dirtyValues.get(id), path, value));
          return;
        }
        if (path.length) {
          throw new Error(
            "May not set dirty with a path for an ID that is not already dirty",
          );
        }
        const newDirtyIds = new Set([...dirtyIds, id]);
        dirtyIdsRef.current = newDirtyIds;
        dirtyValues.set(id, value);
        setDirtyIds(newDirtyIds);
      },
      getDirtyValue: (id: string) => {
        return dirtyValues.get(id);
      },
      dirtyIds,
    };
  }, [dirtyIds]);
  useEffect(() => {
    window.onbeforeunload = (e) => {
      if (dirtyIdsRef.current.size) {
        return "Unsaved changes will be lost.";
      }
      return undefined;
    };
  }, []);
  useEffect(() => {
    beforePopState((state) => {
      // dear god why doesnt next provide the real query params...
      const fragmentString = state.as.split("_=")[1].split("&")[0];
      const fragment = parseFeatureFragment(fragmentString);
      if (
        fragment &&
        allowedToNavigateToFeature(fragment, dirtyIdsRef.current)
      ) {
        return true;
      }
      if (dirtyIdsRef.current.size) {
        window.history.pushState(
          { pushId: Date.now() }, // maybe this is not needed?
          "unused",
          `?_=${latestFeatureRef.current}`,
        );
        openModal(() => {
          dirtyIdsRef.current = new Set();
          push(state.as);
        });
        return false;
      }
      return true;
    });
  }, []);
  const navigateInterrupt = useMemo(() => {
    return (href: string) => {
      if (dirtyIdsRef.current.size) {
        openModal(() => {
          dirtyIdsRef.current = new Set();
          push(href);
        });
        return false;
      } else {
        return true;
      }
    };
  }, []);
  return (
    <UnsavedContext.Provider value={unsavedCtx}>
      <NavigateInterceptContext.Provider value={navigateInterrupt}>
        <DashboardPage<StoreNavigationState>
          Context={StoreDashboardContext}
          onIntercept={(
            feature: StoreNavigationState,
            navigateFeature: (feature: StoreNavigationState) => void,
          ) => {
            if (allowedToNavigateToFeature(feature, dirtyIdsRef.current)) {
              return true;
            }
            if (dirtyIdsRef.current.size) {
              openModal(() => {
                dirtyIdsRef.current = new Set();
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
              if (feature.entryName) {
                if (feature.child === "schema") {
                  let name = feature.entryName;
                  if (feature.path?.length) {
                    name = feature.path.at(-1) as string;
                  }
                  return `Schema: ${displayStoreFileName(name)}`;
                }
                if (feature.path?.length) {
                  const nodeName = feature.path.at(-1) as string;
                  return displayStoreFileName(nodeName);
                }
                return displayStoreFileName(feature.entryName);
              }
              return "Entries";
            }
            if (feature.key === "schemas") {
              const { child, schema, path } = feature;
              if (child === "create") return "Create Schema";
              if (schema) {
                if (path?.length) {
                  const nodeName = path.at(-1) as string;
                  return displayStoreFileName(nodeName);
                }
                return `Schema: ${displayStoreFileName(schema)}`;
              }
              return "Schemas";
            }
            return "?";
          }}
          getFeatureIcon={(feature: StoreNavigationState) => {
            if (feature.key === "entries") {
              if (feature.child === "create") return "plus-circle";
              if (feature.child === "schema") return "crosshairs";
              if (feature.entryName) return "file";
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
              if (feature.child === "schema") {
                if (!feature.entryName)
                  throw new Error(
                    "Cannot display feature for entry without name",
                  );
                return (
                  <StoreEntriesSchemaFeature
                    {...storeFeatureProps}
                    entryName={feature.entryName}
                    path={feature.path || []}
                  />
                );
              }
              if (feature.entryName) {
                return (
                  <StoreEntriesEntryFeature
                    {...storeFeatureProps}
                    entryName={feature.entryName}
                    path={feature.path || []}
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
                    path={feature.path || []}
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
          parseFeatureFragment={parseFeatureFragment}
          stringifyFeatureFragment={(feature: StoreNavigationState) => {
            if (feature.key === "entries") {
              if (feature.child === "create") return "entries--create";
              let fragment = "entries";
              if (feature.entryName) {
                fragment += `-${feature.entryName}`;
              }
              if (feature.child === "schema") {
                fragment += "--schema";
              }
              if (feature.path)
                feature.path.forEach(
                  (entryPathTerm) => (fragment += `-${entryPathTerm}`),
                );
              return fragment;
            }
            if (feature.key === "schemas") {
              let fragment = "schemas";
              if (feature.child === "create") return "schemas--create";
              if (feature.schema) fragment += `-${feature.schema}`;
              if (feature.path)
                feature.path.forEach(
                  (entryPathTerm) => (fragment += `-${entryPathTerm}`),
                );
              return fragment;
            }
            if (feature.key === "settings") {
              return "settings";
            }
            return "";
          }}
          getParentFeatures={(feature) => {
            if (feature.key === "entries") {
              const { entryName, path, child } = feature;
              const parents: StoreNavigationState[] = [];
              if (child === "create") {
                return [{ key: "entries" }];
              }
              if (entryName) {
                parents.push({ key: "entries" });
                if (child === "schema") {
                  parents.push({ key: "entries", entryName });
                }
                path?.forEach((_pathKey, index) => {
                  parents.push({
                    key: "entries",
                    child,
                    entryName,
                    path: path?.slice(0, index) as string[],
                  });
                });
              }
              return parents;
            }
            if (feature.key === "schemas") {
              const { path, schema, child } = feature;
              const parents: StoreNavigationState[] = [];
              if (child || schema) {
                parents.push({ key: "schemas" });
              }
              path?.forEach((_pathKey, index) => {
                parents.push({
                  key: "schemas",
                  child,
                  schema,
                  path: path?.slice(0, index) as string[],
                });
              });
              return parents;
            }
            return [];
          }}
        />
      </NavigateInterceptContext.Provider>
    </UnsavedContext.Provider>
  );
}
