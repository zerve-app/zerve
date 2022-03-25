import React, { ReactNode } from "react";

import { HStack, IconButton, Page, Spinner } from "@zerve/ui";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

export function BackButton() {
  const { canGoBack, goBack, getState } = useNavigation();
  const backable = canGoBack();
  const index = getState().index;
  return (
    (backable || null) && (
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
    )
  );
}

export default function AppPage({
  children,
  right,
  isLoading,
}: {
  children: ReactNode;
  right?: ReactNode;
  isLoading?: boolean;
}) {
  return (
    <Page>
      <HStack>
        <BackButton />
        {right}
        {isLoading && <Spinner />}
      </HStack>
      {children}
    </Page>
  );
}
