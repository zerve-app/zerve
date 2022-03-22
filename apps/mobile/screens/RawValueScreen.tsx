import React from "react";
import { HomeStackScreenProps } from "../app/Links";
import AppPage from "../components/AppPage";
import {
  Button,
  IconButton,
  PageTitle,
  Paragraph,
  useBottomSheet,
  VStack,
} from "@zerve/ui";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { setString } from "expo-clipboard";
import { Icon } from "@zerve/ui/Icon";
import { Pressable } from "react-native";

function RawValuePage({ navigation, route }: HomeStackScreenProps<"RawValue">) {
  const { value, title } = route.params;
  const onOptions = useBottomSheet(({ onClose }) => (
    <VStack>
      <Button
        title="Copy JSON"
        left={(p) => <Icon {...p} name="clipboard" />}
        onPress={() => {
          setString(JSON.stringify(value));
          onClose();
        }}
      />
    </VStack>
  ));
  return (
    <>
      <IconButton
        altTitle="Options"
        onPress={onOptions}
        icon={(p) => <FontAwesome {...p} name="ellipsis-h" />}
      />
      <PageTitle title={title} />
      <Pressable onPress={onOptions}>
        <Paragraph
          style={{
            fontFamily: "Menlo",
          }}
        >
          {JSON.stringify(value, null, 2)}
        </Paragraph>
      </Pressable>
    </>
  );
}

export default function RawValueScreen({
  navigation,
  route,
}: HomeStackScreenProps<"RawValue">) {
  return (
    <AppPage>
      <RawValuePage route={route} navigation={navigation} />
    </AppPage>
  );
}
