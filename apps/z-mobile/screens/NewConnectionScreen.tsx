import React from "react";

import { Button, Input, VStack } from "@zerve/ui";
import { SettingsStackScreenProps } from "../app/Links";
import { createConnection } from "../app/Connection";
import ScreenHeader from "../components/ScreenHeader";
import ScreenContainer from "../components/ScreenContainer";

export default function NewConnectionScreen({
  navigation,
}: SettingsStackScreenProps<"NewConnection">) {
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");
  return (
    <ScreenContainer scroll>
      <ScreenHeader title="New Connection" />
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
    </ScreenContainer>
  );
}
