import React, { useState } from "react";
import { Button, ButtonProps } from "@zerve/zen";
import { GenericError } from "@zerve/core";
import { useGlobalNavigation } from "../app/useNavigation";

export function AsyncButton<PromiseValue>({
  onPress,
  onError,
  ...props
}: {
  onPress: () => Promise<void>;
  onError: (e: GenericError) => void;
} & ButtonProps) {
  const [error, setError] = useState(null);
  const [promise, setPromise] = useState<null | Promise<PromiseValue>>();
  const { openError } = useGlobalNavigation();
  return (
    <Button
      onPress={() => {
        const p = onPress()
          .then(() => {})
          .catch((e) => {
            onError(e);
            openError(e);
          });
        setPromise(p);
        p.finally(() => {
          setPromise(null);
        });
      }}
      {...props}
    />
  );
}
