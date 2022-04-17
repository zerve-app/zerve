import React from "react";

import { SettingsStackScreenProps } from "../app/Links";
import { LinkRow, LinkRowGroup, PageTitle, VStack } from "@zerve/ui";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { WebView } from "react-native-webview";
import { RichTextInput } from "@zerve/richtext-rn";

export default function TestRichTextScreen({
  navigation,
}: SettingsStackScreenProps<"TestRichText">) {
  return (
    <ScreenContainer>
      <RichTextInput />
    </ScreenContainer>
  );
}
