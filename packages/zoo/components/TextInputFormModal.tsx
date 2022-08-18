import React from "react";
import { useModal, VStack } from "@zerve/zen";
import { TextInputForm } from "./TextInputForm";

export function useTextInputFormModal<A>(
  onGetInput: (a: A) => {
    onValue: (value: string, openArgument: A) => void | Promise<void>;
    inputLabel: string;
    defaultValue: string;
    secureTextEntry?: boolean;
  },
) {
  return useModal<A>(({ onClose, options }) => {
    const { inputLabel, defaultValue, secureTextEntry, onValue } =
      onGetInput(options);
    return (
      <VStack padded>
        <TextInputForm
          inputLabel={inputLabel}
          defaultValue={defaultValue}
          secureTextEntry={secureTextEntry}
          onSubmit={async (value) => {
            await onValue(value, options);
            onClose();
          }}
        />
      </VStack>
    );
  });
}
