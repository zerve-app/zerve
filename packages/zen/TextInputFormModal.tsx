import React from "react";
import { useModal } from "./Modal";
import { VStack } from "./Stack";
import { TextInputForm } from "./TextInputForm";

export function useTextInputFormModal<A>(
  onGetInput: (a: A) => {
    onValue: (value: string, openArgument: A) => void | Promise<void>;
    inputLabel: string;
    defaultValue: string;
    secureTextEntry?: boolean;
    validate?: (input: string) => null | string;
  },
) {
  return useModal<A>(({ onClose, options }) => {
    const { inputLabel, defaultValue, secureTextEntry, onValue, validate } =
      onGetInput(options);
    return (
      <VStack padded>
        <TextInputForm
          inputLabel={inputLabel}
          defaultValue={defaultValue}
          secureTextEntry={secureTextEntry}
          validate={validate}
          onSubmit={async (value) => {
            await onValue(value, options);
            onClose();
          }}
          onEscape={onClose}
        />
      </VStack>
    );
  });
}
