import { Text, View } from "dripsy";
import * as Select from "@radix-ui/react-select";

export type DropdownOption = {
  value: boolean | string | number;
  icon?: any;
  title: string;
};

function DropdownItem({
  value,
  icon,
  title,
}: {
  value: boolean | string | number;
  icon?: any;
  title: string;
}) {
  return (
    <Select.Item
      value={value}
      onFocus={() => {
        console.log("focus");
      }}
      onBlur={() => {
        console.log("aayo");
      }}
    >
      <Select.ItemText>{title}</Select.ItemText>
      <Select.ItemIndicator />
    </Select.Item>
  );
}

export function Dropdown<OptionValues>({
  options,
  value,
  onOptionSelect,
  unselectedLabel = "Select...",
}: {
  options: DropdownOption[];
  value: boolean | string | number;
  onOptionSelect: (optionValue: string | number) => void;
  unselectedLabel?: string;
}) {
  const selectedOption = options.find((opt) => opt.value === value);
  return (
    <Select.Root value={value} onValueChange={onOptionSelect}>
      <Select.Trigger>
        <Select.Value>
          {selectedOption ? selectedOption.title : unselectedLabel}
        </Select.Value>
      </Select.Trigger>

      <Select.Content asChild>
        <View sx={{ backgroundColor: "white" }}>
          <Select.ScrollUpButton />
          <Select.Viewport>
            {options.map((option) => (
              <DropdownItem key={option.value} {...option} />
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton />
        </View>
      </Select.Content>
    </Select.Root>
  );
}
