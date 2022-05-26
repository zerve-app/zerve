import React, { useState } from "react";
import { Button, ButtonProps } from "@zerve/zen";
import { useGlobalNavigation } from "../app/useNavigation";

export function AsyncButton<PromiseValue>({
  onPress,
  ...props
}: { onPress: () => Promise<void> } & ButtonProps) {
  const [error, setError] = useState(null);
  const [promise, setPromise] = useState<null | Promise<PromiseValue>>();
  const { openError } = useGlobalNavigation();
  return (
    <Button
      onPress={() => {
        const p = onPress()
          .then(() => {})
          .catch((e) => {
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
