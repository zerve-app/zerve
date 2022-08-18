import React, { useCallback } from "react";
import {
  Input,
  Spinner,
  ThemedText,
  useAsyncHandler,
  VStack,
} from "@zerve/zen";
import { useState } from "react";
import { showErrorToast } from "@zerve/zen/Toast";
import { Form } from "./Form";

export function TextInputForm({
  onSubmit,
  defaultValue = "",
  inputLabel = "name",
  secureTextEntry,
}: {
  onSubmit: (v: string) => Promise<void>;
  defaultValue?: string;
  inputLabel?: string;
  secureTextEntry?: boolean;
}) {
  const [s, setS] = useState(defaultValue || "");
  const handleSubmitAsync = useCallback(async () => {
    await onSubmit(s);
  }, [s]);
  const { handle, isLoading, error } = useAsyncHandler<void, Error>(
    handleSubmitAsync,
  );
  return (
    <Form onSubmit={handle}>
      {error && <ThemedText danger>{error.message}</ThemedText>}
      <Input
        label={inputLabel}
        autoFocus
        value={s}
        onValue={setS}
        returnKeyType="done"
        enablesReturnKeyAutomatically
        onSubmitEditing={handle}
        keyboardType={secureTextEntry ? "password" : "default"}
      />
      {isLoading && <Spinner />}
    </Form>
  );
}
