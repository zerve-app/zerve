import { Button, DisclosureSection, Label, VStack } from "@zerve/ui";
import { useBottomSheet } from "@zerve/ui-native";
import React, { useState } from "react";
import ScreenContainer from "../components/ScreenContainer";
import { showErrorToast, showToast } from "@zerve/ui/Toast";
import ScreenHeader from "../components/ScreenHeader";

function BottomSheetSection() {
  const onOpen = useBottomSheet<void>(({ onClose }) => (
    <VStack>
      <Button title="Close" onPress={onClose} />
    </VStack>
  ));
  return (
    <DisclosureSection header={<Label>Bottom Sheet</Label>}>
      <Button title="Open" onPress={onOpen} />
    </DisclosureSection>
  );
}

function ButtonSection() {
  return (
    <DisclosureSection header={<Label>Button</Label>}>
      <Button
        title="Button"
        onPress={() => {
          showToast("Button Pressed");
        }}
      />
    </DisclosureSection>
  );
}

function ToastSection() {
  return (
    <DisclosureSection header={<Label>Toast</Label>}>
      <Button
        title="Toast"
        onPress={() => {
          showToast("Toast Example");
        }}
      />
      <Button
        title="Error Toast"
        onPress={() => {
          showErrorToast("Error Toast Example");
        }}
      />
    </DisclosureSection>
  );
}

export default function TestUIScreen() {
  return (
    <ScreenContainer scroll>
      <ScreenHeader title="UI Examples" />
      <ButtonSection />
      <ToastSection />
      <BottomSheetSection />
    </ScreenContainer>
  );
}
