import { Title } from "@zerve/zen";
import { memo } from "react";
import { StoreFeatureProps } from "../context/StoreDashboardContext";
import { FeaturePane } from "../web/Dashboard";

function StoreSchemasCreate({ storePath, title }: StoreFeatureProps) {
  return (
    <FeaturePane title={title} spinner={false}>
      <Title title={"soon"} />
    </FeaturePane>
  );
}

export const StoreSchemasCreateFeature = memo(StoreSchemasCreate);
