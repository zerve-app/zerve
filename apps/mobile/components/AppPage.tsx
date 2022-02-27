import React, { ReactNode } from "react";

import { Button, IconButton, Page } from "@zerve/ui";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

export default function AppPage({ children }: { children: ReactNode }) {
  const { canGoBack, goBack } = useNavigation();

  return (
    <Page>
      {canGoBack() && (
        <IconButton
          icon={(props) => <FontAwesome {...props} name="close" />}
          altTitle="close"
          onPress={goBack}
        />
      )}
      {children}
    </Page>
  );
}
