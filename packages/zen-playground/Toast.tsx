import { Button } from "@zerve/zen/Button";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { PageSection } from "@zerve/zen/Page";
import { VStack } from "@zerve/zen/Stack";
import { showErrorToast, showToast } from "@zerve/zen/Toast";

export function ToastPlaygroundFeature() {
  return (
    <FeaturePane title="Toast">
      <PageSection title="Open Toasts">
        <VStack padded>
          <Button
            title="Toast"
            onPress={() => {
              showToast("Toast Example");
            }}
          />
          <Button
            title="Error Toast"
            onPress={() => {
              showErrorToast("Error Toast Example");
            }}
          />
        </VStack>
      </PageSection>
    </FeaturePane>
  );
}
export const ToastPlayground = {
  Feature: ToastPlaygroundFeature,
  icon: "bell",
  name: "toast",
  title: "Toast",
} as const;
