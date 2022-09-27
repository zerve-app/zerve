import { Link } from "@zerve/zen/Link";
import { Paragraph } from "@zerve/zen/Text";
import { FeaturePane } from "@zerve/zen/FeaturePane";

export function HomePlaygroundFeature() {
  return (
    <FeaturePane title="Zen UI Playground">
      <Paragraph>
        A playground to see the{" "}
        <Link inline href="https://docs.zerve.app/docs/internal/zen">
          Zen UI
        </Link>{" "}
        in action!
      </Paragraph>
      <Paragraph>
        Browse the{" "}
        <Link
          inline
          href="https://github.com/zerve-app/zerve/blob/main/packages/zen/"
        >
          code on GitHub
        </Link>{" "}
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
};
