import { FeaturePane } from "@zerve/zen/FeaturePane";
import { PageSection } from "@zerve/zen/Page";
import { Spinner } from "@zerve/zen/Spinner";

function SpinnerPlaygroundFeature() {
  return (
    <FeaturePane title="Spinner">
      <PageSection title="Large">
        <Spinner size="large" />
      </PageSection>
      <PageSection title="Small">
        <Spinner size="small" />
      </PageSection>
    </FeaturePane>
  );
}

export const SpinnerPlayground = {
  Feature: SpinnerPlaygroundFeature,
  icon: "refresh",
  name: "spinner",
  title: "Spinner",
} as const;
