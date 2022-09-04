import { HomeStackScreenProps, RootStackScreenProps } from "../app/Links";
import { Button, IconButton, Paragraph, VStack } from "@zerve/zen";
import { useBottomSheet } from "@zerve/zen";
import { FontAwesome } from "@expo/vector-icons";
import { setString } from "expo-clipboard";
import { Icon } from "@zerve/zen/Icon";
import { Pressable } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";

function RawValuePage({ navigation, route }: RootStackScreenProps<"RawValue">) {
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
    <ScreenContainer scroll>
      <RawValuePage route={route} navigation={navigation} />
    </ScreenContainer>
  );
}
