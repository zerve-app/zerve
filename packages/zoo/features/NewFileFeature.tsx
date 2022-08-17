import React, { useCallback } from "react";

import { Input, VStack } from "@zerve/zen";
import { AsyncButton } from "../components/Button";
import ScreenHeader from "../components/ScreenHeader";
import { useCreateEntry } from "@zerve/client/Mutation";
import { prepareStoreFileName } from "@zerve/core";
import {
  useConnectionNavigation,
  useStoreNavigation,
} from "../app/useNavigation";
import { Form } from "../components/Form";

export function NewFileFeature({ storePath }: { storePath: string[] }) {
  const createEntry = useCreateEntry(storePath);
  const { backToZ } = useConnectionNavigation();
  const { replaceToEntry } = useStoreNavigation(storePath);
  const [name, setName] = React.useState("");
  const handleSubmit = useCallback(async () => {
    const actualName = prepareStoreFileName(name);
    await createEntry.mutate(actualName);
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
