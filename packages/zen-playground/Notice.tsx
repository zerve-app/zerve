import { FeaturePane } from "@zerve/zen/FeaturePane";
import { PageSection } from "@zerve/zen/Page";
import { VStack } from "@zerve/zen/Stack";
import { Notice } from "@zerve/zen/Notice";
import { Button } from "@zerve/zen/Button";

export function NoticePlaygroundFeature() {
  return (
    <FeaturePane title="Notice">
      <PageSection title="Variants">
        <VStack padded>
          <Notice message="Basic Notice with a very long text explanation that will overflow to several lines when presented in a small layout" />
          <Notice message="'Danger' Notice" danger />
          <Notice message="'Primary' Notice" primary />
        </VStack>
      </PageSection>
      <PageSection title="Icons">
        <VStack padded>
          <Notice message="'Info'" icon="info-circle" />
          <Notice message="'Error'" icon="exclamation-triangle" danger />
        </VStack>
      </PageSection>
      <PageSection title="Children">
        <VStack padded>
          <Notice
            message="This notice has a 'delete' button"
            icon="exclamation-circle"
            danger
            children={<Button small title="Delete" onPress={() => {}} />}
          />
        </VStack>
      </PageSection>
    </FeaturePane>
  );
}
export const NoticePlayground = {
  Feature: NoticePlaygroundFeature,
  icon: "exclamation-triangle",
  name: "notice",
  title: "Notice",
};
