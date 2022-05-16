import React, { ReactNode } from "react";

import { IconButton } from "@zerve/zen";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "../app/useNavigation";

export function BackButton({ cancelButton }: { cancelButton?: boolean }) {
  const { canGoBack, goBack } = useNavigation();
  const backable = canGoBack();
  return (
    (backable || null) && (
      <IconButton
        icon={(props) => (
          <FontAwesome
            {...props}
            name={cancelButton ? "close" : "chevron-left"}
          />
        )}
        altTitle="close"
        onPress={goBack}
      />
    )
  );
}
