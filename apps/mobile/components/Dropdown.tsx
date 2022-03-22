import React from "react";
import { Button, useBottomSheet, VStack } from "@zerve/ui";
import { Icon } from "@zerve/ui/Icon";

type DropdownOption = {
  value: string | number;
  icon?: any;
  title: string;
};

export function Dropdown<OptionValues>({
  options,
  value,
  onOptionSelect,
}: {
  options: DropdownOption[];
  value: string;
  onOptionSelect: (optionValue: string | number) => void;
}) {
  const selectedOption = options.find((o) => o.value === value);
  const onOpen = useBottomSheet(({ onClose }) => (
    <VStack>
      {options.map((option) => (
        <Button
          key={option.value}
          title={option.title}
          onPress={() => {
            onClose();
            onOptionSelect(option.value);
          }}
        />
      ))}
    </VStack>
  ));
  return (
    <Button
      title={selectedOption ? selectedOption.title : "Select type..."}
      onPress={onOpen}
      right={(p) => <Icon name="chevron-down" {...p} />}
    />
  );
}
