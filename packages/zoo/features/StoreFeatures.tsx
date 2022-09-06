import { ReactNode } from "react";
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

export function renderFeature(props: {
  feature: StoreNavigationState | null;
  isActive: boolean;
  title: string;
  storePath: string[];
  href: string;
}): ReactNode {
  const { feature, href, storePath, title } = props;
  const storeFeatureProps: StoreFeatureProps = {
    href,
    title,
    storePath,
  };
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
