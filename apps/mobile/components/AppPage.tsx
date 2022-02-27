import React, { ReactNode } from "react";

import { Button, Page } from "@zerve/ui";
import { useNavigation } from "@react-navigation/native";

export default function AppPage({ children }: { children: ReactNode }) {
  const { canGoBack, goBack } = useNavigation();

  return (
    <Page>
      {canGoBack() && <Button title="close" onPress={goBack} />}
      {children}
    </Page>
  );
}
