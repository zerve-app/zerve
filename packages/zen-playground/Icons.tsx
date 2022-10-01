import { FeaturePane } from "@zerve/zen/FeaturePane";
import { PageSection } from "@zerve/zen/Page";
import { HStack } from "@zerve/zen/Stack";
import { View } from "react-native";
import { IconValues } from "./IconValues";
import { Icon } from "@zerve/zen/Icon";
import { useColors } from "@zerve/zen/useColors";
import { Paragraph } from "@zerve/zen/Text";
import { TextLink } from "@zerve/zen/TextLink";

export function IconsPlaygroundFeature() {
  const colors = useColors();
  return (
    <FeaturePane title="Icons">
      <Paragraph>
        Zen currently utilizes{" "}
        <TextLink href="https://fontawesome.com/v4/icons/" external>
          FontAwesome 4
        </TextLink>
        . Imported through{" "}
        <TextLink
          href="https://www.npmjs.com/package/@expo/vector-icons"
          external
        >
          @expo/vector-icons
        </TextLink>{" "}
        (with special thanks to{" "}
        <TextLink
          href="https://github.com/oblador/react-native-vector-icons"
          external
        >
          react-native-vector-icons
        </TextLink>
        ).
      </Paragraph>
      <Paragraph>
        <TextLink href="https://icons.expo.fyi/" external>
          Browse all available icons here
        </TextLink>
      </Paragraph>

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
} as const;
