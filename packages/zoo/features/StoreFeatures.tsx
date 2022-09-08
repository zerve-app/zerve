import { displayStoreFileName } from "@zerve/zed";
import { Icon } from "@zerve/zen";
import { ComponentProps, ReactNode } from "react";
import {
  StoreFeatureProps,
  StoreNavigationState,
} from "../context/StoreDashboardContext";
import { StoreEntriesCreateFeature } from "./StoreEntriesCreateFeature";
import { StoreEntriesEntryFeature } from "./StoreEntriesEntryFeature";
import { StoreEntriesFeature } from "./StoreEntriesFeature";
import { StoreEntriesSchemaFeature } from "./StoreEntriesSchemaFeature";
import { StoreSchemasCreateFeature } from "./StoreSchemasCreateFeature";
import { StoreSchemasFeature } from "./StoreSchemasFeature";
import { StoreSchemasSchemaFeature } from "./StoreSchemasSchemaFeature";
import { StoreSettingsFeature } from "./StoreSettingsFeature";

export function renderFeature(
  props: {
    feature: StoreNavigationState | null;
    isActive: boolean;
  } & StoreFeatureProps,
): ReactNode {
  const { feature, isActive, ...featureProps } = props;
  const storeFeatureProps: StoreFeatureProps = featureProps;
  if (feature?.key === "entries") {
    if (feature.child === "create") {
      return <StoreEntriesCreateFeature {...storeFeatureProps} />;
    }
    if (feature.child === "schema") {
      if (!feature.entryName)
        throw new Error("Cannot display feature for entry without name");
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
}

export function getFeatureTitle(feature: StoreNavigationState) {
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
}

export function getFeatureIcon(feature: StoreNavigationState) {
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
}

export function stringifyFeatureFragment(feature: StoreNavigationState) {
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
}

export function parseFeatureFragment(
  fragment?: string,
): null | StoreNavigationState {
  if (!fragment) return null;
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

export function allowedToNavigateToFeatureWithDirty(
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
