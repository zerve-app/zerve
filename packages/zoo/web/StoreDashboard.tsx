import { useEffect, useMemo, useRef, useState } from "react";
import {
  StoreDashboardContext,
  StoreNavigationState,
  UnsavedContext,
} from "../context/StoreDashboardContext";
import { DashboardPage } from "./Dashboard";
import { OrgHeader, ProjectHeader, UserHeader } from "./DashboardHeader";
import { useRouter } from "next/router";
import { NavBarSpacer, NavigateInterceptContext, useModal } from "@zerve/zen";
import { Dialog } from "@zerve/zen/Dialog";
import { AuthHeader } from "../components/AuthHeader";
import {
  getFeatureIcon,
  getFeatureTitle,
  parseFeatureFragment,
  renderFeature,
  stringifyFeatureFragment,
} from "../features/StoreFeatures";

function allowedToNavigateToFeature(
  feature: StoreNavigationState,
  dirtyId: null | string,
) {
  if (!dirtyId) return true;
  if (feature.key === "entries" && feature.child === "schema") {
    if (dirtyId === `entry-schema-${feature.entryName}`) {
      return true;
    }
  }
  if (feature.key === "entries") {
    if (dirtyId === `entry-${feature.entryName}`) {
      if (!feature.child) return true;
    }
  }
  if (feature.key === "schemas") {
    if (dirtyId === `schema-${feature.schema}`) {
      return true;
    }
  }
  console.warn("Refusing to exit with dirty id", dirtyId);
  return false;
}

export type StoreDashboardProps = {
  href: string;
  storeId: string;
  entityId: string | null;
  entityIsOrg: boolean;
  storePath: string[];
};

export function StoreDashboard({
  href,
  storeId,
  entityId,
  entityIsOrg,
  storePath,
}: StoreDashboardProps) {
  const { beforePopState, push } = useRouter();
  const dirtyIdRef = useRef<null | string>(null);
  const dirtyValue = useRef<null | any>(null);
  const [dirtyId, setDirtyId] = useState<null | string>(null);
  const latestFeatureRef = useRef<null | string>(null);
  const unsavedCtx = useMemo(() => {
    return {
      releaseDirty: (id: string) => {
        dirtyValue.current = null;
        dirtyIdRef.current = null;
        setDirtyId(null);
      },
      claimDirty: (id: string, value: any) => {
        dirtyValue.current = value;
        dirtyIdRef.current = id;
        if (dirtyId !== id) {
          setDirtyId(id);
        }
      },
      getDirtyValue: (id: string) => {
        if (id === dirtyIdRef.current) return dirtyValue.current;
        return undefined;
      },
      dirtyId,
    };
  }, [dirtyId]);
  const openModal = useModal<() => void>(
    ({ onClose, options: followThroughNavigate }) => (
      <Dialog
        onClose={onClose}
        title="Discard Unsaved Changes?"
        danger
        confirmLabel="Discard Changes"
        closeLabel="Cancel"
        onConfirm={async () => {
          dirtyValue.current = null;
          dirtyIdRef.current = null;
          setDirtyId(null);
          onClose();
          followThroughNavigate();
        }}
      />
    ),
  );
  useEffect(() => {
    window.onbeforeunload = (e) => {
      if (dirtyIdRef.current) {
        return "Unsaved changes will be lost.";
      }
      return undefined;
    };
  }, []);
  useEffect(() => {
    beforePopState((state) => {
      // dear god why doesnt next provide the real query params...
      const fragmentString = state.as.split("_=")[1]?.split("&")[0];
      const fragment = parseFeatureFragment(fragmentString);
      if (
        fragment &&
        allowedToNavigateToFeature(fragment, dirtyIdRef.current)
      ) {
        return true;
      }
      if (dirtyIdRef.current) {
        window.history.pushState(
          { pushId: Date.now() }, // maybe this is not needed?
          "unused",
          `?_=${latestFeatureRef.current}`,
        );
        openModal(() => {
          push(state.as);
        });
        return false;
      }
      return true;
    });
  }, []);
  const navigateInterrupt = useMemo(() => {
    return (href: string) => {
      if (dirtyIdRef.current) {
        openModal(() => {
          push(href);
        });
        return false;
      } else {
        return true;
      }
    };
  }, []);
  const sidebarFeatures: StoreNavigationState[] = [
    { key: "entries" },
    { key: "schemas" },
  ];
  if (entityId) {
    sidebarFeatures.push({ key: "settings" });
  }
  return (
    <UnsavedContext.Provider value={unsavedCtx}>
      <NavigateInterceptContext.Provider value={navigateInterrupt}>
        <DashboardPage<StoreNavigationState>
          Context={StoreDashboardContext}
          onIntercept={(
            feature: StoreNavigationState,
            navigateFeature: (feature: StoreNavigationState) => void,
          ) => {
            if (allowedToNavigateToFeature(feature, dirtyIdRef.current)) {
              return true;
            }
            if (dirtyIdRef.current) {
              openModal(() => {
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
              {!!entityId && entityIsOrg ? (
                <OrgHeader orgId={entityId} />
              ) : null}
              {!!entityId && !entityIsOrg ? (
                <UserHeader userId={entityId} />
              ) : null}
              <ProjectHeader href={href} label={storeId} />
              <NavBarSpacer />
              {!!entityId ? <AuthHeader /> : null}
            </>
          }
          navigation={sidebarFeatures}
          defaultFeature={{ key: "entries" }}
          getFeatureTitle={getFeatureTitle}
          getFeatureIcon={getFeatureIcon}
          renderFeature={(featureProps) => {
            return renderFeature({ ...featureProps, href, storePath });
          }}
          parseFeatureFragment={parseFeatureFragment}
          stringifyFeatureFragment={stringifyFeatureFragment}
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
