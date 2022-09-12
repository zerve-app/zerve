import { ColorValue, Text, View } from "react-native";
import * as Select from "@radix-ui/react-select";
import Layout from "./Layout";
import { useAllColors, useColors } from "./useColors";
import { Pressable } from "react-native";
import { memo, useState } from "react";
import { Icon } from "./Icon";
import { smallShadow } from "./Style";

export type DropdownOption = {
  value: string;
  icon?: any;
  title: string;
};

function DropdownItem({
  value,
  icon,
  title,
  active,
  unselected,
  onSelect,
}: {
  value: boolean | string | number;
  icon?: any;
  title: string;
  active?: boolean;
  unselected?: boolean;
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
          paddingHorizontal: 12,
          paddingVertical: unselected ? 6 : 12,
          flexDirection: "row",
          borderWidth: 3,
          borderColor: focused ? colors.tint : "transparent",
        }}
        onPress={onSelect}
      >
        <Select.ItemText asChild>
          <Text
            style={{
              fontWeight: active && !unselected ? "bold" : "normal",
              flex: 1,
              color: focused
                ? inverted.text
                : unselected
                ? colors.secondaryText
                : colors.text,
            }}
          >
            {title}
          </Text>
        </Select.ItemText>

        {active && !unselected ? (
          <Icon
            name="check"
            color={focused ? inverted.tint : colors.tint}
            size={16}
          />
        ) : null}

        <Select.ItemIndicator />
      </Pressable>
    </Select.Item>
  );
}

const UNSELECTED_ITEM_KEY = "$dropdown_unselected_key";

export function DropdownUnmemo({
  options,
  value,
  tint,
  onOptionSelect,
  unselectedLabel = "Select...",
  id,
  allowUnselect,
}: {
  options: DropdownOption[];
  value: string | null;
  id: string;
  onOptionSelect: (optionValue: string) => void;
  tint?: ColorValue | null;
  unselectedLabel?: string;
  allowUnselect?: boolean;
}) {
  const selectedOption = options.find((opt) => opt.value === value);
  const { background, text, secondaryText } = useColors();
  const allOptions: DropdownOption[] =
    selectedOption === undefined || allowUnselect
      ? [{ value: UNSELECTED_ITEM_KEY, title: unselectedLabel }, ...options]
      : options;
  return (
    <Select.Root
      value={value == null ? UNSELECTED_ITEM_KEY : value}
      onValueChange={onOptionSelect}
    >
      <Select.Trigger
        id={id}
        style={{
          display: "flex",
          alignSelf: "stretch",
          justifySelf: "stretch",
          backgroundColor: tint || background,
          borderRadius: Layout.borderRadius,
          padding: 12,
          flexDirection: "row",
          border: "1px solid rgba(80, 80, 80, 0.2)",
        }}
      >
        <Select.Value asChild>
          <Text
            style={{
              paddingRight: 12,
              flex: 1,
              textAlign: "left",
              color: selectedOption === undefined ? secondaryText : text,
            }}
          >
            {selectedOption === undefined
              ? unselectedLabel
              : selectedOption.title}
          </Text>
        </Select.Value>
        <Icon name="chevron-down" size={16} color={secondaryText} />
      </Select.Trigger>

      <Select.Content>
        <Select.ScrollUpButton />
        <Select.Viewport>
          <View
            style={{
              backgroundColor: background,
              borderRadius: Layout.borderRadius,
              borderWidth: 1,
              borderColor: "#ccc",
              ...smallShadow,
            }}
          >
            {allOptions.map((option) => (
              <DropdownItem
                key={option.value}
                unselected={option.value === UNSELECTED_ITEM_KEY}
                active={
                  option.value === value ||
                  (value == null && option.value === UNSELECTED_ITEM_KEY)
                }
                value={option.value}
                title={option.title}
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

export const Dropdown = memo(DropdownUnmemo);
