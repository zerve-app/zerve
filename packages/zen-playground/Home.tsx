import { TextLink } from "@zerve/zen/TextLink";
import { Paragraph } from "@zerve/zen/Text";
import { FeaturePane } from "@zerve/zen/FeaturePane";

export function HomePlaygroundFeature() {
  return (
    <FeaturePane title="Zen UI Playground">
      <Paragraph>
        A playground to see the{" "}
        <TextLink href="https://docs.zerve.app/docs/internal/zen">
          Zen UI
        </TextLink>{" "}
        in action!
      </Paragraph>
      <Paragraph>
        Browse the{" "}
        <TextLink href="https://github.com/zerve-app/zerve/blob/main/packages/zen/">
          code on GitHub
        </TextLink>{" "}
        to see the full suite of components that power Zerve.
      </Paragraph>
      <Paragraph>
        This is (clearly) a work in progress. The main priority is the Zerve
        Content System!
      </Paragraph>
    </FeaturePane>
  );
}
export const HomePlayground = {
  Feature: HomePlaygroundFeature,
  icon: "home",
  name: "home",
  title: "Home",
} as const;
