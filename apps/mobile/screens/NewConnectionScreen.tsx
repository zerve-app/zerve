import React from "react";

import { Button, Page, PageTitle } from "@zerve/ui";
import AppPage from "../components/AppPage";
import { HomeStackScreenProps } from "../navigation/Links";

export default function NewConnectionScreen({
  navigation,
}: HomeStackScreenProps<"NewConnection">) {
  // const { goBack } = useNavigation();
  return (
    <AppPage>
      <PageTitle title="NewConnection" />
    </AppPage>
  );
}
