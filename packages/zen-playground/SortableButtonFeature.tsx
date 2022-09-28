import { FeaturePane } from "@zerve/zen/FeaturePane";
import { PageSection } from "@zerve/zen/Page";
import { VStack } from "@zerve/zen/Stack";
import { Notice } from "@zerve/zen/Notice";
import { Button } from "@zerve/zen/Button";

export function SortableButtonsFeature() {
  return (
    <FeaturePane title="Sortable Buttons">
      <PageSection title="Variants"></PageSection>
    </FeaturePane>
  );
}

export const SortableButtonsFeaturePlayground = {
  Feature: SortableButtonsFeature,
  icon: "leaf",
  name: "sortable-buttons",
  title: "Sortable Buttons",
} as const;
