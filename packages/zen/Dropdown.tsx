import { Text, View } from "dripsy";
import * as Select from "@radix-ui/react-select";
import { bigShadow, smallShadow } from "./Style";
import Layout from "./Layout";
import { useAllColors, useColors } from "./useColors";
import { Pressable } from "react-native";
import { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Icon } from "./Icon";

export type DropdownOption = {
  value: boolean | string | number;
  icon?: any;
  title: string;
};

function DropdownItem({
  value,
  icon,
  title,
  active,
  onSelect,
}: {
  value: boolean | string | number;
  icon?: any;
  title: string;
  active?: boolean;
  onSelect: () => void;
}) {
  const { active: colors, inverted } = useAllColors();
  const [focused, setIsFocused] = useState(false);
  return (
    <Select.Item
      value={value}
      onFocus={() => {
        setIsFocused(true);
      }}
      onBlur={() => {
        setIsFocused(false);
      }}
    >
      <Pressable
        style={{
          backgroundColor: focused ? colors.tint : "transparent",
          padding: 12,
          flexDirection: "row",
        }}
        onPress={onSelect}
      >
        <Select.ItemText asChild>
          <Text sx={{ flex: 1, color: focused ? inverted.text : colors.text }}>
            {title}
          </Text>
        </Select.ItemText>

        {active && (
          <FontAwesome
            name="check"
            color={focused ? inverted.text : colors.text}
            size={24}
          />
        )}

        <Select.ItemIndicator />
      </Pressable>
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
  const { background } = useColors();
  return (
    <Select.Root value={value} onValueChange={onOptionSelect}>
      <Select.Trigger
        style={{
          border: "none",
          display: "flex",
          alignSelf: "stretch",
          justifySelf: "stretch",
          backgroundColor: background,
          borderRadius: Layout.borderRadius,
          padding: 12,
          flexDirection: "row",
          boxShadow: "rgb(17 17 17 / 25%) 0px 3px 3px", // matches smallShadow
        }}
      >
        <Select.Value asChild>
          <Text sx={{ paddingHorizontal: 12, flex: 1, textAlign: "left" }}>
            {selectedOption ? selectedOption.title : unselectedLabel}
          </Text>
        </Select.Value>
        <Icon name="chevron-down" />
      </Select.Trigger>

      <Select.Content>
        <Select.ScrollUpButton />
        <Select.Viewport asChild>
          <View
            sx={{
              backgroundColor: background,
              borderRadius: Layout.borderRadius,
              ...bigShadow,
            }}
          >
            {options.map((option) => (
              <DropdownItem
                key={option.value}
                active={option.value === value}
                {...option}
                onSelect={() => {
                  onOptionSelect(option.value);
                }}
              />
            ))}
          </View>
        </Select.Viewport>
        <Select.ScrollDownButton />
      </Select.Content>
    </Select.Root>
  );
}
