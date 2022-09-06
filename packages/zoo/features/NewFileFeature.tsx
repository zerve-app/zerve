import React, { useCallback } from "react";

import { Input, VStack, Form, showToast } from "@zerve/zen";
import { AsyncButton } from "../components/Button";
import ScreenHeader from "../components/ScreenHeader";
import { useCreateEntry } from "@zerve/zoo-client/Mutation";
import { prepareStoreFileName } from "@zerve/zed";
import { useConnectionNavigation } from "../app/useNavigation";
import { useStoreNavigation } from "../app/useStoreNavigation";

export function NewFileFeature({ storePath }: { storePath: string[] }) {
  const createEntry = useCreateEntry(storePath);
  const { backToZ } = useConnectionNavigation();
  const { replaceToEntry } = useStoreNavigation(storePath);
  const [name, setName] = React.useState("");
  const handleSubmit = useCallback(async () => {
    const actualName = prepareStoreFileName(name);
    await createEntry.mutateAsync(actualName);
    showToast("Entry Created");
    replaceToEntry(actualName);
  }, [name]);
  return (
    <>
      <ScreenHeader title="New Entry" onBack={() => backToZ(storePath)} />
      <Form onSubmit={handleSubmit}>
        <VStack padded>
          <Input
            value={name}
            label="Name"
            onValue={setName}
            autoFocus
            placeholder="My File"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
          <AsyncButton title="Create" primary onPress={handleSubmit} />
        </VStack>
      </Form>
    </>
  );
}
