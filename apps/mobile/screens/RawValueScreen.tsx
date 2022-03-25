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
import { FontAwesome } from "@expo/vector-icons";
import { setString } from "expo-clipboard";
import { Icon } from "@zerve/ui/Icon";
import { Pressable } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";

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
      <ScreenHeader
        title={title}
        corner={
          <IconButton
            altTitle="Options"
            onPress={onOptions}
            icon={(p) => <FontAwesome {...p} name="ellipsis-h" />}
          />
        }
      />
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
    <ScreenContainer>
      <RawValuePage route={route} navigation={navigation} />
    </ScreenContainer>
  );
}
