import React from "react";

import { RootStackScreenProps } from "../app/Links";
import { Paragraph } from "@zerve/ui";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";

export default function ErrorScreen({
  navigation,
  route,
}: RootStackScreenProps<"Error">) {
  return (
    <ScreenContainer scroll>
      <ScreenHeader
        title={
          route.params.error.code
            ? `Error: ${route.params.error.code}`
            : "App Error"
        }
      />
      <Paragraph>{route.params.error.message}</Paragraph>
      <Paragraph>{JSON.stringify(route.params.error.params)}</Paragraph>
    </ScreenContainer>
  );
}
