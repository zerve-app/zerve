import { TouchableOpacity } from "react-native";
import React from "react";

import { RootStackScreenProps } from "../navigation/Links";
import { Button, Page, Paragraph } from "@zerve/ui";

export default function NotFoundScreen({
  navigation,
}: RootStackScreenProps<"NotFound">) {
  return (
    <Page>
      <Paragraph>This screen doesn't exist.</Paragraph>
      <Button
        onPress={() => navigation.replace("HomeStack")}
        title="Go to home screen!"
      />
    </Page>
  );
}
