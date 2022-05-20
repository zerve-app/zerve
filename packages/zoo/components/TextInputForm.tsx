import React, { useCallback } from "react";
import { Input, VStack } from "@zerve/zen";
import { useState } from "react";
import { showErrorToast } from "@zerve/zen/Toast";
import { Form } from "./Form";

export function TextInputForm({
  onSubmit,
  defaultValue = "",
  inputLabel = "name",
}: {
  onSubmit: (v: string) => void;
  defaultValue?: string;
  inputLabel?: string;
}) {
  const [s, setS] = useState(defaultValue || "");
  const handleSubmit = useCallback(() => {
    try {
      onSubmit(s);
    } catch (e) {
      showErrorToast(e.message);
    }
  }, [s]);
  return (
    <Form onSubmit={handleSubmit}>
      <Input
        label={inputLabel}
        autoFocus
        value={s}
        onValue={setS}
        returnKeyType="done"
        enablesReturnKeyAutomatically
        onSubmitEditing={handleSubmit}
        // InputComponent={BottomSheetTextInput}
      />
    </Form>
  );
}
