import { Title } from "@zerve/zen";
import { memo } from "react";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import { FeaturePane } from "../web/Dashboard";

function StoreSettings({ storePath, title }: StoreFeatureProps) {
  return (
    <FeaturePane title={title}>
      <Title title="soon" />
    </FeaturePane>
  );
}

export const StoreSettingsFeature = memo(StoreSettings);
