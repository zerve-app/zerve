import { useEffect, useMemo, useRef } from "react";
import {
  StoreDashboardContext,
  StoreNavigationState,
} from "../context/StoreDashboardContext";
import { DashboardPage } from "./Dashboard";
import { OrgHeader, ProjectHeader, UserHeader } from "./DashboardHeader";
import { useRouter } from "next/router";
import { NavBarSpacer, NavigateInterceptContext } from "@zerve/zen";
import { AuthHeader } from "../components/AuthHeader";
import {
  allowedToNavigateToFeatureWithDirty,
  getFeatureIcon,
  getFeatureTitle,
  parseFeatureFragment,
  renderFeature,
  stringifyFeatureFragment,
} from "../features/StoreFeatures";
import { useDiscardChangesDialog } from "../components/useDiscardChangesDialog";
import { UnsavedContext, useUnsaved } from "../app/Unsaved";

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
  const { beforePopState, push, replace } = useRouter();
  const latestFeatureRef = useRef<null | string>(null);
  const unsaved = useUnsaved();
  const openDiscardChangesDialog = useDiscardChangesDialog(() => {
    unsaved.discardDirty();
  });
  useEffect(() => {
    window.onbeforeunload = (e) => {
      if (unsaved.hasUnsaved()) {
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
        allowedToNavigateToFeatureWithDirty(fragment, unsaved.getDirtyId())
      ) {
        return true;
      }
      if (unsaved.hasUnsaved()) {
        window.history.pushState(
          { pushId: Date.now() }, // maybe this is not needed?
          "unused",
          `?_=${latestFeatureRef.current}`,
        );
        openDiscardChangesDialog(() => {
          push(state.as);
        });
        return false;
      }
      return true;
    });
  }, []);
  const navigateInterrupt = useMemo(() => {
    return (href: string) => {
      if (unsaved.hasUnsaved()) {
        openDiscardChangesDialog(() => {
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
  const parentLocation = href.split("/").slice(0, -1);
  return (
    <UnsavedContext.Provider value={unsaved}>
      <NavigateInterceptContext.Provider value={navigateInterrupt}>
        <DashboardPage<StoreNavigationState>
          Context={StoreDashboardContext}
          onIntercept={(
            feature: StoreNavigationState,
            navigateFeature: (feature: StoreNavigationState) => void,
          ) => {
            if (
              allowedToNavigateToFeatureWithDirty(feature, unsaved.getDirtyId())
            ) {
              return true;
            }
            if (unsaved.hasUnsaved()) {
              openDiscardChangesDialog(() => {
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
            return renderFeature({
              ...featureProps,
              storePath,
              onStoreDelete: () => {
                push(`${parentLocation.join("/")}`);
              },
              onStoreRename: (newStoreId) => {
                push(`${[...parentLocation, newStoreId].join("/")}`);
              },
            });
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
