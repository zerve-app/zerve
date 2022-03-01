import React from "react";

import { RootStackScreenProps } from "../app/Links";
import { PageTitle } from "@zerve/ui";
import AppPage from "../components/AppPage";

export default function KitchenSinkScreen({
  navigation,
}: RootStackScreenProps<"Settings">) {
  // const { goBack } = useNavigation();
  return (
    <AppPage>
      <PageTitle title="Kitchen Sink" />
    </AppPage>
  );
}
