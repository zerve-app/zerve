import { Button } from "@zerve/zen/Button";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { Icon } from "@zerve/zen/Icon";
import { PageSection } from "@zerve/zen/Page";
import { VStack } from "@zerve/zen/Stack";
import { showToast } from "@zerve/zen/Toast";
import { useColors } from "@zerve/zen/useColors";

export function ButtonPlaygroundFeature() {
  const colors = useColors();
  return (
    <FeaturePane title="Button">
      <PageSection title="Modes">
        <VStack padded>
          <Button
            title="Pressable"
            onPress={() => {
              showToast("Pressed");
            }}
          />
          <Button
            title="Long Pressable"
            onPress={() => {
              showToast("Pressed");
            }}
            onLongPress={() => {
              showToast("Long Pressed");
            }}
          />
          <Button
            title="Disabled"
            disabled
            onPress={() => {
              showToast("This does not happen");
            }}
          />
        </VStack>
      </PageSection>
      <PageSection title="Variants">
        <VStack padded>
          <Button title="Normal" onPress={() => {}} />
          <Button title="Danger" danger onPress={() => {}} />
          <Button title="Primary" primary onPress={() => {}} />
          <Button title="Chromeless" chromeless onPress={() => {}} />
        </VStack>
        <PageSection title="Sizes">
          <VStack padded>
            <Button title="Normal" onPress={() => {}} />
            <Button title="Small" small onPress={() => {}} />
          </VStack>
        </PageSection>
        <PageSection title="Tint">
          <VStack padded>
            <Button
              title="Changed Tint"
              tint={colors.changedTint}
              onPress={() => {}}
            />
          </VStack>
        </PageSection>
        <PageSection title="Icons">
          <VStack padded>
            <Button
              title="Trash"
              danger
              left={(p) => <Icon {...p} name="trash" />}
              onPress={() => {}}
            />
            <Button
              title="Refresh"
              left={(p) => <Icon {...p} name="refresh" />}
              onPress={() => {}}
            />
          </VStack>
        </PageSection>
      </PageSection>
    </FeaturePane>
  );
}

export const ButtonPlayground = {
  Feature: ButtonPlaygroundFeature,
  icon: "hand-o-right",
  title: "Button",
  name: "button",
} as const;
