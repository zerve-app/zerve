import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Button, ButtonProps } from "@zerve/ui";

export function AsyncButton({
  onPress,
  ...props
}: { onPress: () => Promise<void> } & ButtonProps) {
  const navigation = useNavigation();
  return (
    <Button
      onPress={() => {
        onPress()
          .then(() => {})
          .catch((e) => {
            navigation.navigate("Error", { error: e });
          });
      }}
      {...props}
    />
  );
}
