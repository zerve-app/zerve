import { useBottomSheet } from "./BottomSheet";
import { Icon } from "./Icon";
import { VStack } from "./Stack";
import { Button } from "./Button";
import { useColors } from "./useColors";
import { Alert, ColorValue } from "react-native";

export type DropdownOption = {
  value: boolean | string | number;
  icon?: any;
  title: string;
};

export function Dropdown<OptionValues>({
  options,
  value,
  onOptionSelect,
  id,
  tint,
  unselectedLabel = "Select...",
}: {
  options: DropdownOption[];
  value: boolean | string | number;
  onOptionSelect: (optionValue: string | number) => void;
  id: string;
  tint?: ColorValue | null;
  unselectedLabel?: string;
}) {
  const colors = useColors();
  const selectedOption = options.find((o) => o.value === value);
  const onOpen = useBottomSheet(({ onClose }) => (
    <VStack padded>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Button
            key={option.value}
            title={option.title}
            tint={tint}
            onPress={() => {
              onClose();
              onOptionSelect(option.value);
            }}
            primary={isActive}
            right={(p) =>
              isActive ? <Icon {...p} name="check" color={colors.tint} /> : null
            }
          />
        );
      })}
    </VStack>
  ));
  return (
    <Button
      title={selectedOption?.title || unselectedLabel}
      tint={tint}
      onPress={onOpen}
      right={(p) => (
        <Icon name="chevron-down" {...p} color={colors.secondaryText} />
      )}
    />
  );
}
