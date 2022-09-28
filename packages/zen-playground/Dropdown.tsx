import { useState, ComponentProps } from "react";
import { FeaturePane } from "@zerve/zen/FeaturePane";
import { PageSection } from "@zerve/zen/Page";
import { Dropdown } from "@zerve/zen/Dropdown";
import { HStack, VStack } from "@zerve/zen/Stack";
import { useColors } from "../zen/useColors";
import { Icon } from "../zen/Icon";
import { IconValues } from "./IconValues";

const ExampleOptions = [
  { title: "Foo", value: "foo" },
  { title: "Bar", value: "bar" },
] as const;

function DropdownUnselected() {
  const colors = useColors();
  const [value, setValue] = useState<
    null | typeof ExampleOptions[number]["value"]
  >(null);
  return (
    <Dropdown
      id={"unselected"}
      value={value}
      tint={value !== null ? colors.changedTint : undefined}
      unselectedLabel={`Not Selected`}
      onOptionSelect={setValue}
      options={ExampleOptions}
    />
  );
}

const IconDropdownOptions = IconValues.map((value) => ({
  title: value,
  value,
}));

function IconDropdown() {
  const [icon, setIcon] = useState<ComponentProps<typeof Icon>["name"]>("gear");
  return (
    <HStack edgelessExperimental>
      <Icon name={icon} />
      <Dropdown
        id={"icons"}
        value={icon}
        onOptionSelect={setIcon}
        options={IconDropdownOptions}
      />
    </HStack>
  );
}

export function DropdownFeature() {
  return (
    <FeaturePane title="Dropdown">
      <PageSection title="With Changed Tint">
        <VStack padded>
          <DropdownUnselected />
        </VStack>
      </PageSection>
      <PageSection title="Lots of Options">
        <VStack padded>
          <IconDropdown />
        </VStack>
      </PageSection>
    </FeaturePane>
  );
}
export const DropdownPlayground = {
  Feature: DropdownFeature,
  icon: "chevron-down",
  name: "dropdown",
  title: "Dropdown",
} as const;
