import React from "react";

import { Button, Input, Page, PageTitle } from "@zerve/ui";
import AppPage from "../components/AppPage";
import { HomeStackScreenProps } from "../navigation/Links";
import { destroyConnection } from "../components/Connection";

export default function ConnectionScreen({
  navigation,
  route,
}: HomeStackScreenProps<"Connection">) {
  return (
    <AppPage>
      <PageTitle title="Connection" />
      <Button
        onPress={() => {
          destroyConnection(route.params.connection);
          navigation.goBack();
        }}
        title="Delete Server Connection"
      />
    </AppPage>
  );
}
