import React from "react";

import { Input, VStack } from "@zerve/zen";
import { HomeStackParamList, HomeStackScreenProps } from "../app/Links";
import { AsyncButton } from "../components/Button";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { useCreateFile } from "@zerve/client/Mutation";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { prepareStoreFileName } from "@zerve/core";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";

function NewFilePage({
  route,
}: {
  route: HomeStackScreenProps<"NewFile">["route"];
}) {
  const { replace } =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { storePath } = route.params;
  const createFile = useCreateFile(storePath);

  const [name, setName] = React.useState("");

  return (
    <>
      <ScreenHeader title="New File" />
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
            replace("File", {
              name: actualName,
              storePath,
              connection: route.params.connection,
            });
          }}
        />
      </VStack>
    </>
  );
}

export default function NewFileScreen({
  route,
}: HomeStackScreenProps<"NewFile">) {
  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={route.params.connection}>
        <NewFilePage route={route} />
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
