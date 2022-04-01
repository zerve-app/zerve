import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Button, ButtonProps } from "@zerve/ui";

export function AsyncButton({
  onPress,
  ...props
}: { onPress: () => Promise<void> } & ButtonProps) {
  const [error, setError] = useState(null);
  const [promise, setPromise] = useState();
  const navigation = useNavigation();
  return (
    <Button
      onPress={() => {
        const promise = onPress()
          .then(() => {})
          .catch((e) => {
            navigation.navigate("Error", { error: e });
          });
        setPromise(promise);
        promise.finally(() => {
          setPromise(null);
        });
      }}
      {...props}
    />
  );
}
