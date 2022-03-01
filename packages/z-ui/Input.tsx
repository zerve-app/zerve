import { TextInput, View } from "react-native";
import { useColors } from "./useColorScheme";
import { Label } from "./Text";
import { marginHInset, marginVInset, RowStyles } from "./Row";

export function Input({
  value,
  onValue,
  label,
  placeholder,
  autoCapitalize,
  autoFocus,
  disabled,
}: {
  value: string;
  onValue?: (value: string) => void;
  label: string;
  placeholder?: string;
  autoCapitalize?: "characters" | "words" | "none" | "sentences";
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={{}}>
      <Label style={[marginHInset, marginVInset]}>{label}</Label>
      <TextInput
        placeholderTextColor={colors.lightText}
        autoFocus={autoFocus}
        style={{
          ...RowStyles,
          color: colors.text,
          borderColor: colors.text,
          backgroundColor: colors.background,
        }}
        focusable={!disabled}
        editable={!disabled}
        autoCapitalize={autoCapitalize}
        value={value}
        placeholder={placeholder}
        onChangeText={onValue}
      />
    </View>
  );
}
