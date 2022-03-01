import React from "react";

import { Button, Input, Page, PageTitle, VStack } from "@zerve/ui";
import AppPage from "../components/AppPage";
import { SettingsStackScreenProps } from "../app/Links";
import { createConnection } from "../app/Connection";

export default function NewConnectionScreen({
  navigation,
}: SettingsStackScreenProps<"NewConnection">) {
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
          primary
          onPress={() => {
            createConnection(name, url);
            navigation.goBack();
          }}
        />
      </VStack>
    </AppPage>
  );
}
