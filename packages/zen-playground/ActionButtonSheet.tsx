import { View } from "react-native";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { PageSection } from "@zerve/zen/Page";
import { HGroup, VStack } from "@zerve/zen/Stack";
import { Button, ButtonContent } from "@zerve/zen/Button";
import { Label } from "@zerve/zen/Label";
import { Icon } from "@zerve/zen/Icon";
import { useActionsSheet } from "@zerve/zen/ActionButtonSheet";
import { useColors } from "@zerve/zen/useColors";

function LabelWithActions() {
  const { tint } = useColors();
  const [labelView] = useActionsSheet(
    (onOpen) => (
      <View
        style={{ flexDirection: "row", alignItems: "center", marginRight: 30 }}
      >
        <Label tint style={{ marginRight: 8, textAlign: "left" }}>
          Click for Actions
        </Label>

        <Icon name="chevron-down" color={tint} size={12} />
      </View>
    ),
    [
      { key: "copy", title: "Copy", onPress: () => {}, icon: "clipboard" },
      {
        key: "delete",
        title: "Delete",
        onPress: () => {},
        icon: "trash",
        danger: true,
      },
    ],
  );
  return labelView;
}

function OptionsButton() {
  const [optionsButton] = useActionsSheet(
    () => (
      <ButtonContent
        title="Options"
        left={(p) => <Icon name="gear" {...p} />}
      />
    ),
    [
      { key: "copy", title: "Copy", onPress: () => {}, icon: "clipboard" },
      {
        key: "delete",
        title: "Delete",
        onPress: () => {},
        icon: "trash",
        danger: true,
      },
    ],
  );
  return optionsButton;
}

export function ActionButtonSheetPlaygroundFeature() {
  return (
    <FeaturePane title="Action Sheet">
      <PageSection title="On Label">
        <VStack padded>
          <LabelWithActions />
        </VStack>
      </PageSection>
      <PageSection title="On Button">
        <VStack padded>
          <OptionsButton />
        </VStack>
      </PageSection>
    </FeaturePane>
  );
}
export const ActionButtonSheetPlayground = {
  Feature: ActionButtonSheetPlaygroundFeature,
  icon: "chevron-circle-down",
  name: "action-button-sheet",
  title: "Action Buttons",
} as const;
