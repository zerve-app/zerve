import { useState, ReactElement } from "react";
import { Input, SwitchInput } from "@zerve/zen/Input";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { Icon } from "@zerve/zen/Icon";
import { PageSection } from "@zerve/zen/Page";
import { VStack } from "@zerve/zen/Stack";
import { showToast } from "@zerve/zen/Toast";
import { useColors } from "@zerve/zen/useColors";

function InputExample<V>({
  defaultValue,
  renderInput,
}: {
  defaultValue: V;
  renderInput: (props: { onValue: (v: V) => void; value: V }) => ReactElement;
}) {
  const [value, setValue] = useState(defaultValue);
  return renderInput({ value, onValue: setValue });
}

export function InputPlaygroundFeature() {
  const colors = useColors();
  return (
    <FeaturePane title="Input">
      <PageSection title="Text">
        <VStack padded>
          <Input label="Disabled" value="No Input Allowed" disabled />
          <InputExample
            defaultValue="Input Me"
            renderInput={({ value, onValue }) => (
              <Input label="Basic (Label)" value={value} onValue={onValue} />
            )}
          />
          <InputExample
            defaultValue="Input Me"
            renderInput={({ value, onValue }) => (
              <Input
                label="Tint"
                tint={colors.changedTint}
                value={value}
                onValue={onValue}
              />
            )}
          />
        </VStack>
      </PageSection>
      <PageSection title="Switch">
        <VStack padded>
          <SwitchInput label="Disabled Switch" value={true} disabled />
          <InputExample
            defaultValue={false}
            renderInput={({ value, onValue }) => (
              <SwitchInput
                label="Basic Switch"
                value={value}
                onValue={onValue}
              />
            )}
          />
        </VStack>
      </PageSection>
    </FeaturePane>
  );
}

export const InputPlayground = {
  Feature: InputPlaygroundFeature,
  icon: "file-text",
  title: "Input",
  name: "Input",
} as const;
