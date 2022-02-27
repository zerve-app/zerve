import React, { ReactNode } from "react";

import { Button, IconButton, Page } from "@zerve/ui";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

export default function AppPage({ children }: { children: ReactNode }) {
  const { canGoBack, goBack, getState } = useNavigation();
  const backable = canGoBack();
  const index = getState().index;
  return (
    <Page>
      {backable && (
        <IconButton
          icon={(props) => (
            <FontAwesome
              {...props}
              name={index === 0 ? "close" : "chevron-left"}
            />
          )}
          altTitle="close"
          onPress={goBack}
        />
      )}
      {children}
    </Page>
  );
}
