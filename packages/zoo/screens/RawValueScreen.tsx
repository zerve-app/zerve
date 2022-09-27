import { RootStackScreenProps } from "../app/Links";
import { Button, IconButton, Paragraph, VStack } from "@zerve/zen";
import { useBottomSheet } from "@zerve/zen";
import { setStringAsync } from "expo-clipboard";
import { Icon } from "@zerve/zen/Icon";
import { Pressable } from "react-native";
import ScreenHeader from "@zerve/zen/ScreenHeader";
import ScreenContainer from "@zerve/zen/ScreenContainer";

function RawValuePage({ navigation, route }: RootStackScreenProps<"RawValue">) {
  const { value, title } = route.params;
  const onOptions = useBottomSheet<void>(({ onClose }) => (
    <VStack padded>
      <Button
        title="Copy JSON"
        left={(p) => <Icon {...p} name="clipboard" />}
        onPress={() => {
          setStringAsync(JSON.stringify(value)).then(() => {
            onClose();
          });
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
            onPress={() => {
              onOptions();
            }}
            icon={(p) => <Icon {...p} name="ellipsis-v" />}
          />
        }
      />
      <Pressable
        onPress={() => {
          onOptions();
        }}
      >
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
}: RootStackScreenProps<"RawValue">) {
  return (
    <ScreenContainer scroll>
      <RawValuePage route={route} navigation={navigation} />
    </ScreenContainer>
  );
}
