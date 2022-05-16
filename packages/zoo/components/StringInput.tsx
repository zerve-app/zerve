import React from "react";
import { Input, VStack } from "@zerve/zen";
import { useBottomSheet } from "@zerve/zen-native";
import { useState } from "react";
import { showErrorToast } from "@zerve/zen/Toast";

export function StatefulInput({
  onSubmit,
  defaultValue = "",
  inputLabel = "name",
}: {
  onSubmit: (v: string) => void;
  defaultValue?: string;
  inputLabel?: string;
}) {
  const [s, setS] = useState(defaultValue);
  return (
    <>
      <Input
        label={inputLabel}
        autoFocus
        value={s}
        onValue={setS}
        returnKeyType="done"
        enablesReturnKeyAutomatically
        onSubmitEditing={() => {
          try {
            onSubmit(s);
          } catch (e) {
            showErrorToast(e.message);
          }
        }}
        // InputComponent={BottomSheetTextInput}
      />
    </>
  );
}

export function useStringInput<A>(
  onGetInput: (a: A) => {
    onValue: (value: string, openArgument: A) => void;
    inputLabel: string;
    defaultValue: string;
  }
) {
  return () => {};
  // return useBottomSheet<A>(({ onClose, options }) => {
  //   const { inputLabel, defaultValue, onValue } = onGetInput(options);
  //   return (
  //     <VStack>
  //       <StatefulInput
  //         inputLabel={inputLabel}
  //         defaultValue={defaultValue}
  //         onSubmit={(value) => {
  //           onValue(value, options);
  //           onClose();
  //         }}
  //       />
  //     </VStack>
  //   );
  // });
}
