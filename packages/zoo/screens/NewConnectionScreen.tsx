import { Button, Input, VStack } from "@zerve/zen";
import { SettingsStackScreenProps } from "../app/Links";
import { createConnection } from "../app/ConnectionStorage";
import { useState } from "react";
import ScreenContainer from "@zerve/zen/ScreenContainer";
import ScreenHeader from "@zerve/zen/ScreenHeader";

export default function NewConnectionScreen({
  navigation,
}: SettingsStackScreenProps<"NewConnection">) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  return (
    <ScreenContainer scroll>
      <ScreenHeader title="New Connection" />
      <VStack padded>
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
          keyboardType="url"
          placeholder="https://alpha.zerve.app"
          autoComplete="off"
        />
        <Button
          title="Connect to Server"
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
