import { FeaturePane } from "@zerve/zen/FeaturePane";
import { PageSection } from "@zerve/zen/Page";
import { HStack } from "@zerve/zen/Stack";
import { View } from "react-native";
import { IconValues } from "./IconValues";
import { Icon } from "../zen/Icon";
import { useColors } from "../zen/useColors";

export function IconsPlaygroundFeature() {
  const colors = useColors();
  return (
    <FeaturePane title="Icons">
      <PageSection title="Size">
        <HStack padded>
          <Icon name="wifi" size={12} />
          <Icon name="wifi" />
          <Icon name="wifi" size={36} />
        </HStack>
      </PageSection>
      <PageSection title="Color">
        <HStack padded>
          <Icon name="wifi" color={colors.tint} />
          <Icon name="wifi" color={colors.dangerText} />
          <Icon name="wifi" color={colors.secondaryText} />
        </HStack>
      </PageSection>
      <PageSection title="All Icons">
        <View
          style={{
            flexWrap: "wrap",
            flexDirection: "row",
            paddingHorizontal: 8,
          }}
        >
          {IconValues.map((name) => (
            <View style={{ padding: 8 }}>
              <Icon name={name} />
            </View>
          ))}
        </View>
      </PageSection>
    </FeaturePane>
  );
}
export const IconsPlayground = {
  Feature: IconsPlaygroundFeature,
  icon: "star",
  name: "icons",
  title: "Icons",
};
