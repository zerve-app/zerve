import React from "react";
import { useModal, VStack } from "@zerve/zen";
import { TextInputForm } from "./TextInputForm";

export function useTextInputFormModal<A>(
  onGetInput: (a: A) => {
    onValue: (value: string, openArgument: A) => void;
    inputLabel: string;
    defaultValue: string;
  }
) {
  return useModal<A>(({ onClose, options }) => {
    const { inputLabel, defaultValue, onValue } = onGetInput(options);
    return (
      <VStack>
        <TextInputForm
          inputLabel={inputLabel}
          defaultValue={defaultValue}
          onSubmit={(value) => {
            onValue(value, options);
            onClose();
          }}
        />
      </VStack>
    );
  });
}
