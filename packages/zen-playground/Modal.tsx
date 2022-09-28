import { useState } from "react";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { PageSection } from "@zerve/zen/Page";
import { VStack } from "@zerve/zen/Stack";
import { Button } from "@zerve/zen/Button";
import { Title } from "@zerve/zen/Text";
import { useModal } from "@zerve/zen/Modal";
import { useTextInputFormModal } from "@zerve/zen/TextInputFormModal";
import { ThemedText } from "@zerve/zen/Themed";

function BasicModal() {
  const open = useModal<void>(({ onClose }) => {
    return (
      <VStack padded>
        <Title title="Simple Modal" />
        <Button onPress={onClose} title="Close" />
      </VStack>
    );
  });
  return <Button title="Basic Modal" onPress={open} />;
}

function OptionsModal() {
  const open = useModal<number>(({ onClose, options }) => {
    return (
      <VStack padded>
        <Title title={`You passed in number: ${options}`} />
      </VStack>
    );
  });
  return <Button title="Options Modal (pass 42)" onPress={() => open(42)} />;
}

function TextInputModal() {
  const [text, setText] = useState("default text");
  const open = useTextInputFormModal<void>(() => ({
    inputLabel: "Set the new text",
    defaultValue: text,
    onValue: (t) => {
      setText(t);
    },
  }));
  return (
    <>
      <ThemedText>Your text is: {text}</ThemedText>
      <Button title="Modify Text" onPress={open} />
    </>
  );
}

export function ModalPlaygroundFeature() {
  return (
    <FeaturePane title="Modal">
      <PageSection title="Basic">
        <VStack padded>
          <BasicModal />
          <OptionsModal />
        </VStack>
      </PageSection>
      <PageSection title="Text Input">
        <VStack padded>
          <TextInputModal />
        </VStack>
      </PageSection>
    </FeaturePane>
  );
}
export const ModalPlayground = {
  Feature: ModalPlaygroundFeature,
  icon: "window-maximize",
  name: "modal",
  title: "Modal",
};
