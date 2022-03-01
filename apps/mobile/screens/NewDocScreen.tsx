import React from "react";

import { Input, PageTitle, VStack } from "@zerve/ui";
import AppPage from "../components/AppPage";
import { HomeStackScreenProps } from "../app/Links";
import { appendChain } from "@zerve/native";
import { AsyncButton } from "../components/Button";

export default function NewDocScreen({
  navigation,
}: HomeStackScreenProps<"NewDoc">) {
  const [name, setName] = React.useState("");
  return (
    <AppPage>
      <PageTitle title="New Project" />
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
            await appendChain(name, {
              type: "WriteFile",
              name: "ReadMe.md",
              value: "Welcome to your new project",
            });
            navigation.replace("Doc", { name });
          }}
        />
      </VStack>
    </AppPage>
  );
}
