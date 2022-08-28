import React, { ComponentProps } from "react";
import { Switch, TextInput, View } from "react-native";
import { useColors } from "./useColors";
import { Label } from "./Label";
import { getRowStyles, marginHInset, marginVInset } from "./Row";
import { ZTextInputType } from "@zerve/zed";

export function Input({
  value,
  id,
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
  id?: string;
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
        id={id}
        nativeID={id}
        placeholderTextColor={colors.secondaryText}
        autoFocus={autoFocus}
        style={{
          ...getRowStyles(colors),
          color: colors.text,
          backgroundColor: colors.background,
          outlineColor: colors.tint,
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
