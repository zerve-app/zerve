import React from "react";

import { Input, PageTitle, VStack } from "@zerve/ui";
import { HomeStackScreenProps } from "../app/Links";
import { dispatch } from "@zerve/native";
import { AsyncButton } from "../components/Button";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";

export default function NewDocScreen({
  navigation,
}: HomeStackScreenProps<"NewDoc">) {
  const [name, setName] = React.useState("");
  return (
    <ScreenContainer scroll>
      <ScreenHeader title="New Project" />
      <VStack>
        <Input
          value={name}
          label="Name"
          onValue={setName}
          autoFocus
          placeholder="My Project"
        />
        <AsyncButton
          title="Create"
          primary
          onPress={async () => {
            await dispatch(name, {
              type: "WriteFile",
              name: "ReadMe.md",
              value: "Welcome to your new project",
            });
            navigation.replace("Doc", { name, connection: null });
          }}
        />
      </VStack>
    </ScreenContainer>
  );
}
