import ScreenContainer from "@zerve/zen/ScreenContainer";
import ScreenHeader from "@zerve/zen/ScreenHeader";
import { showErrorToast, showToast } from "@zerve/zen/Toast";
import { useBottomSheet } from "@zerve/zen/BottomSheet";
import { Button } from "@zerve/zen/Button";
import { DisclosureSection } from "@zerve/zen/Disclosure";
import { Label } from "@zerve/zen/Label";
import { VStack } from "@zerve/zen/Stack";

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

export function TestUIFeature() {
  return (
    <>
      <ScreenHeader title="UI Examples" />
      <ButtonSection />
      <ToastSection />
      <BottomSheetSection />
    </>
  );
}

export default function TestUIScreen() {
  return (
    <ScreenContainer scroll>
      <TestUIFeature />
    </ScreenContainer>
  );
}
