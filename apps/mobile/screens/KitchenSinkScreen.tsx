import React from "react";

import { SettingsStackScreenProps } from "../app/Links";
import { LinkRow, PageTitle, VStack } from "@zerve/ui";
import AppPage from "../components/AppPage";

export default function KitchenSinkScreen({
  navigation,
}: SettingsStackScreenProps<"KitchenSink">) {
  return (
    <AppPage>
      <PageTitle title="Kitchen Sink" />
      <VStack>
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
    </AppPage>
  );
}
