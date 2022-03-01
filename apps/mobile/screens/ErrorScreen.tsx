import React from "react";

import { RootStackScreenProps } from "../app/Links";
import { Page, PageTitle, Paragraph } from "@zerve/ui";
import AppPage from "../components/AppPage";

export default function ErrorScreen({
  navigation,
  route,
}: RootStackScreenProps<"Error">) {
  return (
    <AppPage>
      <PageTitle
        title={
          route.params.error.code
            ? `Error: ${route.params.error.code}`
            : "App Error"
        }
      />
      <Paragraph>{route.params.error.message}</Paragraph>
      <Paragraph>{JSON.stringify(route.params.error.params)}</Paragraph>
    </AppPage>
  );
}
