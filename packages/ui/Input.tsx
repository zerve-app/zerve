import React, { ComponentProps } from "react";
import { Switch, TextInput, View } from "react-native";
import { useColors } from "./useColors";
import { Label } from "./Text";
import { marginHInset, marginVInset, RowStyles } from "./Row";

export function Input({
  value,
  onValue,
  onSubmitEditing,
  label,
  placeholder,
  autoCapitalize,
  autoFocus,
  disabled,
  keyboardType,
  returnKeyType,
  enablesReturnKeyAutomatically,
  InputComponent,
  onBlur,
}: {
  value: string;
  onValue?: (value: string) => void;
  onSubmitEditing?: () => void;
  label?: string;
  placeholder?: string;
  autoCapitalize?: "characters" | "words" | "none" | "sentences";
  autoFocus?: boolean;
  disabled?: boolean;
  InputComponent?: any;
  onBlur?: () => void;
  enablesReturnKeyAutomatically?: boolean;
  returnKeyType?: ComponentProps<typeof TextInput>["returnKeyType"];
  keyboardType?:
    | "default"
    | "numeric"
    | "email-address"
    | "ascii-capable"
    | "numbers-and-punctuation"
    | "url"
    | "number-pad"
    | "phone-pad"
    | "name-phone-pad"
    | "decimal-pad"
    | "twitter"
    | "web-search"
    | "visible-password";
}) {
  const colors = useColors();
  const TextInputComponent = InputComponent || TextInput;
  return (
    <View style={{}}>
      {label != null && (
        <Label style={[marginHInset, marginVInset]}>{label}</Label>
      )}
      <TextInputComponent
        placeholderTextColor={colors.secondaryText}
        autoFocus={autoFocus}
        style={{
          ...RowStyles,
          color: colors.text,
          borderColor: colors.text,
          backgroundColor: colors.background,
        }}
        focusable={!disabled}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        editable={!disabled}
        enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
        autoCapitalize={autoCapitalize}
        onSubmitEditing={onSubmitEditing}
        value={value}
        placeholder={placeholder}
        onChangeText={onValue}
        onBlur={onBlur}
      />
    </View>
  );
}

export function SwitchInput({
  value,
  onValue,
  label,
  disabled,
}: {
  value: boolean;
  onValue?: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <View style={{}}>
      {label != null && (
        <Label style={[marginHInset, marginVInset]}>{label}</Label>
      )}
      <Switch onValueChange={onValue} value={value} disabled={disabled} />
    </View>
  );
}
