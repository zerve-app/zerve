import React from "react";

import { Input, VStack } from "@zerve/zen";
import { AsyncButton } from "../components/Button";
import ScreenHeader from "../components/ScreenHeader";
import { useCreateFile } from "@zerve/client/Mutation";
import { prepareStoreFileName } from "@zerve/core";
import {
  useConnectionNavigation,
  useStoreNavigation,
} from "../app/useNavigation";

export function NewFileFeature({ storePath }: { storePath: string[] }) {
  const createFile = useCreateFile(storePath);
  const { backToZ } = useConnectionNavigation();
  const { replaceToFile } = useStoreNavigation(storePath);
  const [name, setName] = React.useState("");

  return (
    <>
      <ScreenHeader title="New File" onBack={() => backToZ(storePath)} />
      <VStack>
        <Input
          value={name}
          label="Name"
          onValue={setName}
          autoFocus
          placeholder="My File"
        />
        <AsyncButton
          title="Create"
          primary
          onPress={async () => {
            const actualName = prepareStoreFileName(name);
            await createFile.mutate(actualName);
            replaceToFile(actualName);
          }}
        />
      </VStack>
    </>
  );
}
