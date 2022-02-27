import { TextInput, View } from "react-native";
import { ThemedText } from "./Themed";
import Layout from "./Layout";
import { useColors } from "./useColorScheme";
import { smallShadow } from "./Style";

type ButtonProps = { title: string; onPress: () => void };

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
  onValue: (value: string) => void;
  label: string;
  placeholder?: string;
  autoCapitalize?: "characters" | "words" | "none" | "sentences";
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={{}}>
      <ThemedText
        style={{ marginHorizontal: 12, marginVertical: 6, fontWeight: "bold" }}
      >
        {label}
      </ThemedText>
      <TextInput
        placeholderTextColor={colors.lightText}
        autoFocus={autoFocus}
        style={{
          color: colors.text,
          borderColor: colors.text,
          backgroundColor: colors.background,
          borderRadius: Layout.borderRadius,
          ...smallShadow,
          padding: 12,
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
