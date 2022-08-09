import React, { ComponentProps } from "react";
import { Switch, TextInput, View } from "react-native";
import { useColors } from "./useColors";
import { Label } from "./Text";
import { marginHInset, marginVInset, RowStyles } from "./Row";
import { ZTextInputType } from "@zerve/core";

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
  autoComplete,
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
  autoComplete?: ComponentProps<typeof TextInput>["autoComplete"];
  keyboardType?: ZTextInputType;
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
        keyboardType={keyboardType === "password" ? "default" : keyboardType}
        secureTextEntry={keyboardType === "password"}
        returnKeyType={returnKeyType}
        editable={!disabled}
        enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
        autoCapitalize={autoCapitalize}
        onSubmitEditing={onSubmitEditing}
        value={value}
        autoComplete={autoComplete}
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
      {label != null && <Label>{label}</Label>}
      <Switch onValueChange={onValue} value={value} disabled={disabled} />
    </View>
  );
}
