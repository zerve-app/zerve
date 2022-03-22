import React from "react";

import { HomeStackScreenProps } from "../app/Links";
import AppPage from "../components/AppPage";
import {
  Button,
  HStack,
  PageTitle,
  Paragraph,
  useBottomSheet,
  VStack,
} from "@zerve/ui";
import { useDocEval } from "../app/Doc";
import { deleteDoc } from "@zerve/native";

function DocOptionsMenu({
  name,
  navigation,
  onClose,
}: {
  onClose: () => void;
  name: string;
  navigation: HomeStackScreenProps<"Doc">["navigation"];
}) {
  return (
    <VStack style={{}}>
      <Button title="New Folder" onPress={() => {}} />
      <Button
        title="Delete Project"
        danger
        onPress={() => {
          onClose();
          deleteDoc(name);
          navigation.goBack();
        }}
      />
      <Button title="2 Folder" primary onPress={() => {}} />
    </VStack>
  );
}

export default function DocScreen({
  navigation,
  route,
}: HomeStackScreenProps<"Doc">) {
  const { connection, name } = route.params;
  const doc = useDocEval(connection, name);
  const onOptions = useBottomSheet(({ onClose }) => (
    <DocOptionsMenu name={name} navigation={navigation} onClose={onClose} />
  ));
  return (
    <AppPage>
      <PageTitle title={name} />
      <Paragraph>{JSON.stringify(doc)}</Paragraph>
      <HStack>
        <Button title="New Document" onPress={() => {}} />
        <Button title="New Folder" onPress={() => {}} />
      </HStack>

      <HStack>
        <Button
          title="Delete Project"
          danger
          onPress={() => {
            deleteDoc(name);
            navigation.goBack();
          }}
        />
        <Button title="Options" onPress={onOptions} />
      </HStack>
    </AppPage>
  );
}
