import React, { useCallback } from "react";

import { Input, VStack } from "@zerve/zen";
import { AsyncButton } from "../components/Button";
import ScreenHeader from "../components/ScreenHeader";
import { useCreateFile } from "@zerve/client/Mutation";
import { prepareStoreFileName } from "@zerve/core";
import {
  useConnectionNavigation,
  useStoreNavigation,
} from "../app/useNavigation";
import { Form } from "../components/Form";

export function NewFileFeature({ storePath }: { storePath: string[] }) {
  const createFile = useCreateFile(storePath);
  const { backToZ } = useConnectionNavigation();
  const { replaceToFile } = useStoreNavigation(storePath);
  const [name, setName] = React.useState("");
  const handleSubmit = useCallback(async () => {
    const actualName = prepareStoreFileName(name);
    await createFile.mutate(actualName);
    replaceToFile(actualName);
  }, [name]);
  return (
    <>
      <ScreenHeader title="New File" onBack={() => backToZ(storePath)} />
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
