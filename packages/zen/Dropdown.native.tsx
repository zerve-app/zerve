import { useBottomSheet } from "./BottomSheet";
import { Icon } from "./Icon";
import { VStack } from "./Stack";
import { Button } from "./Button";
import { useColors } from "./useColors";

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
  unselectedLabel = "Select...",
}: {
  options: DropdownOption[];
  value: boolean | string | number;
  onOptionSelect: (optionValue: string | number) => void;
  id: string;
  unselectedLabel?: string;
}) {
  const colors = useColors();
  const selectedOption = options.find((o) => o.value === value);
  const onOpen = useBottomSheet(({ onClose }) => (
    <VStack>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Button
            key={option.value}
            title={option.title}
            onPress={() => {
              onClose();
              onOptionSelect(option.value);
            }}
            primary={isActive}
            right={(p) =>
              isActive ? (
                <Icon {...p} name="check" color={colors.secondaryText} />
              ) : null
            }
          />
        );
      })}
    </VStack>
  ));
  return (
    <Button
      title={selectedOption?.title || unselectedLabel}
      onPress={onOpen}
      right={(p) => (
        <Icon name="chevron-down" {...p} color={colors.secondaryText} />
      )}
    />
  );
}
