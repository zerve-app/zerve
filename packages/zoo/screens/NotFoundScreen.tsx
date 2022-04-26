import React from "react";

import { RootStackScreenProps } from "../app/Links";
import { Paragraph } from "@zerve/ui";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";

export default function NotFoundScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader title="Not Found." />
      <Paragraph>This screen doesn't exist.</Paragraph>
    </ScreenContainer>
  );
}
