import React, { ComponentProps } from "react";
import { ColorValue, Switch, TextInput, View } from "react-native";
import { useColors } from "./useColors";
import { Label } from "./Label";
import { getRowStyles, marginHInset, marginVInset } from "./Row";
import { ZTextInputType } from "@zerve/zed";
import Layout from "./Layout";

export function Input({
  value,
  id,
  onValue,
  onSubmitEditing,
  label,
  tint,
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
  onEscape,
}: {
  value: string;
  id?: string;
  onValue?: (value: string) => void;
  onSubmitEditing?: () => void;
  label?: string;
  tint?: ColorValue | null;
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
  onEscape?: () => void;
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
          backgroundColor: tint || colors.background,
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
        onKeyPress={(e) => {
          if (e.nativeEvent.key === "Escape") onEscape?.();
        }}
      />
    </View>
  );
}

export function SwitchInput({
  value,
  onValue,
  label,
  tint,
  disabled,
}: {
  value: boolean;
  onValue?: (value: boolean) => void;
  label?: string;
  tint?: ColorValue | null;
  disabled?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        backgroundColor: tint || undefined,
        borderRadius: Layout.borderRadius,
        padding: Layout.paddingHorizontal,
      }}
    >
      {label != null && <Label>{label}</Label>}
      <Switch
        onValueChange={onValue}
        value={value}
        disabled={disabled}
        activeThumbColor={colors.secondaryText}
        ios_backgroundColor={colors.secondaryText}
        thumbColor={colors.background}
        trackColor={{
          false: colors.secondaryText,
          true: colors.tint,
        }}
      />
    </View>
  );
}
