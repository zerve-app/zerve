import { Title, VStack } from "@zerve/zen";
import { memo } from "react";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import { FeaturePane } from "../web/Dashboard";

function StoreSettings({ storePath, title }: StoreFeatureProps) {
  return (
    <FeaturePane title={title}>
      <VStack padded>
        <Title title="Experimental Features:" />
      </VStack>
    </FeaturePane>
  );
}

export const StoreSettingsFeature = memo(StoreSettings);
