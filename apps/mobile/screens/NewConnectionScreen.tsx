import React from "react";

import { Button, Input, Page, PageTitle, VStack } from "@zerve/ui";
import AppPage from "../components/AppPage";
import { HomeStackScreenProps } from "../navigation/Links";
import { createConnection } from "../components/Connection";

export default function NewConnectionScreen({
  navigation,
}: HomeStackScreenProps<"NewConnection">) {
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");
  return (
    <AppPage>
      <PageTitle title="New Connection" />
      <VStack>
        <Input
          value={name}
          label="Name"
          onValue={setName}
          autoFocus
          placeholder="My Server"
        />
        <Input
          value={url}
          label="URL"
          onValue={setUrl}
          autoCapitalize="none"
          placeholder="https://zerve.app"
        />
        <Button
          title="Create"
          onPress={() => {
            createConnection(name, url);
            navigation.goBack();
          }}
        />
      </VStack>
    </AppPage>
  );
}
