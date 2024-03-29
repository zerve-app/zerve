import { SettingsStackScreenProps } from "../app/Links";
import ScreenContainer from "@zerve/zen/ScreenContainer";
import ScreenHeader from "@zerve/zen/ScreenHeader";
import { VStack } from "@zerve/zen/Stack";
import { LinkRowGroup } from "@zerve/zen/Row";

export default function KitchenSinkScreen({
  navigation,
}: SettingsStackScreenProps<"KitchenSink">) {
  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Kitchen Sink" />
      <VStack padded>
        <LinkRowGroup
          links={[
            {
              key: "history",
              title: "History",
              icon: "history",
              onPress: () => {
                navigation.navigate("TestHistory");
              },
            },
            {
              key: "ui",
              title: "UI Examples",
              icon: "check-square",
              onPress: () => {
                navigation.navigate("TestUI");
              },
            },
            {
              key: "json",
              title: "JSON Editor Examples",
              icon: "file-code-o",
              onPress: () => {
                navigation.navigate("TestJSONInput");
              },
            },
            {
              key: "sort",
              title: "Sort Example",
              icon: "list-ul",
              onPress: () => {
                navigation.navigate("TestSort");
              },
            },
          ]}
        />
      </VStack>
    </ScreenContainer>
  );
}
