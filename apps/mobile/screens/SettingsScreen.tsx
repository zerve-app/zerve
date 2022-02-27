import React from "react";

import { RootStackScreenProps } from "../navigation/Links";
import { Button, Page, PageTitle } from "@zerve/ui";
import AppPage from "../components/AppPage";

export default function SettingsScreen({
  navigation,
}: RootStackScreenProps<"Settings">) {
  // const { goBack } = useNavigation();
  return (
    <AppPage>
      <PageTitle title="App Settings" />
      <Button
        title="Kitchen Sink"
        onPress={() => {
          navigation.navigate("KitchenSink");
        }}
      />
    </AppPage>
  );
}
