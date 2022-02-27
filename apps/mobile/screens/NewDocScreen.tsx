import React from "react";

import { Button, Input, Page, PageTitle, VStack } from "@zerve/ui";
import AppPage from "../components/AppPage";
import { HomeStackScreenProps } from "../navigation/Links";
import { createDoc } from "../components/Data";

export default function NewDocScreen({
  navigation,
}: HomeStackScreenProps<"NewDoc">) {
  const [name, setName] = React.useState("");
  return (
    <AppPage>
      <PageTitle title="New Document" />
      <VStack>
        <Input
          value={name}
          label="Name"
          onValue={setName}
          autoFocus
          placeholder="My Doc"
        />
        <Button
          title="Create"
          primary
          onPress={() => {
            // createDoc(name);
            navigation.replace("Doc", { name });
          }}
        />
      </VStack>
    </AppPage>
  );
}
