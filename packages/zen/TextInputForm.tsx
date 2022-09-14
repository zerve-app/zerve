import React, { useCallback } from "react";
import { useState } from "react";
import { Form } from "./Form";
import { Input } from "./Input";
import { Notice } from "./Notice";
import { Spinner } from "./Spinner";
import { useAsyncHandler } from "./useAsyncHandler";

export function TextInputForm({
  onSubmit,
  defaultValue = "",
  inputLabel = "name",
  secureTextEntry,
  onEscape,
  validate,
}: {
  onSubmit: (v: string) => Promise<void>;
  defaultValue?: string;
  inputLabel?: string;
  secureTextEntry?: boolean;
  onEscape?: () => void;
  validate?: (input: string) => null | string;
}) {
  const [s, setS] = useState(defaultValue || "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const handleSubmitAsync = useCallback(async () => {
    if (validate) {
      let invalidError = validate(s);
      setValidationError(invalidError);
      if (invalidError) return;
    }
    await onSubmit(s);
  }, [s, validate]);
  const { handle, isLoading, error } = useAsyncHandler<void, Error>(
    handleSubmitAsync,
  );
  return (
    <Form onSubmit={handle}>
      {error && <Notice danger message={error.message} />}
      {validationError && <Notice danger message={validationError} />}
      <Input
        label={inputLabel}
        autoFocus
        value={s}
        onValue={setS}
        returnKeyType="done"
        enablesReturnKeyAutomatically
        onSubmitEditing={handle}
        onEscape={onEscape}
        keyboardType={secureTextEntry ? "password" : "default"}
      />
      {isLoading && <Spinner />}
    </Form>
  );
}
