import React from "react";

import { SettingsStackScreenProps } from "../app/Links";
import { LinkRow, PageTitle, VStack } from "@zerve/ui";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";

export default function KitchenSinkScreen({
  navigation,
}: SettingsStackScreenProps<"KitchenSink">) {
  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Kitchen Sink" />
      <VStack>
        <LinkRow
          title="UI Examples"
          icon="list-ul"
          onPress={() => {
            navigation.navigate("TestUI");
          }}
        />

        <LinkRow
          title="JSON Schema"
          icon="list-ul"
          onPress={() => {
            navigation.navigate("TestJSONInput");
          }}
        />
        <LinkRow
          title="Test Sort"
          icon="list-ul"
          onPress={() => {
            navigation.navigate("TestSort");
          }}
        />
      </VStack>
    </ScreenContainer>
  );
}
