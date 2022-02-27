import { Button } from "react-native";
import React from "react";

import { HomeStackScreenProps } from "../navigation/Links";
import AppPage from "../components/AppPage";
import { PageTitle } from "@zerve/ui";

export default function DocScreen({
  navigation,
  route,
}: HomeStackScreenProps<"Doc">) {
  return (
    <AppPage>
      <PageTitle title={`Doc: ${route.params.name}`} />
    </AppPage>
  );
}
