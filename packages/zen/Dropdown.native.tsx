import { useBottomSheet } from "./BottomSheet";
import { Icon } from "./Icon";
import { Padding, VStack } from "./Stack";
import { Button } from "./Button";
import { useColors } from "./useColors";
import { ColorValue, Dimensions } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

export type DropdownOption = {
  value: string | number;
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
  const onOpen = useBottomSheet<void>(({ onClose }) => (
    <BottomSheetFlatList
      data={options}
      style={{
        // a hacky way instead of maxHeight:'90%' which causes issues with bottom-sheet (assumed to be the measurement logic)
        maxHeight: Dimensions.get("window").height * 0.8,
      }}
      contentContainerStyle={{}}
      keyExtractor={(option) => String(option.value)}
      renderItem={({ item }) => {
        const isActive = item.value === value;
        return (
          <Padding key={String(item.value)}>
            <Button
              title={item.title}
              onPress={() => {
                onClose();
                onOptionSelect(item.value);
              }}
              primary={isActive}
              right={(p) =>
                isActive ? (
                  <Icon {...p} name="check" color={colors.tint} />
                ) : null
              }
            />
          </Padding>
        );
      }}
    />
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
