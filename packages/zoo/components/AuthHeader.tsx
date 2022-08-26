import { useConnection } from "@zerve/client/Connection";
import { Button, HStack, Link, ThemedText, useModal } from "@zerve/zen";
import { Text, View } from "react-native";
import { isSeeminglyAnonUser, LoginForm } from "./Auth";
import { useRouter } from "next/router";

function UserProfileIcon() {
  return (
    <View
      style={{
        height: 36,
        width: 36,
        backgroundColor: "#222",
        borderRadius: 18,
        margin: 12,
      }}
    />
  );
}

export function AuthHeader() {
  const { push } = useRouter();
  const openLogin = useModal<void>(({ onClose }) => (
    <LoginForm
      path={["Auth"]}
      authMeta={{}}
      onComplete={(userId) => {
        onClose();
        push(`/${userId}`);
      }}
    />
  ));
  const conn = useConnection();
  const session = conn?.session;
  if (session) {
    const { userLabel, userId } = session;
    const url = `/${userId}`;
    return (
      <Link href={url}>
        <View style={{ flexDirection: "row", marginLeft: 40 }}>
          <ThemedText
            style={{ alignSelf: "center", fontWeight: "bold", fontSize: 16 }}
          >
            {isSeeminglyAnonUser(userId) ? userLabel : userId}
          </ThemedText>
          <UserProfileIcon />
        </View>
      </Link>
    );
  }
  return (
    <HStack>
      <Button
        title="Log In / Register"
        small
        onPress={() => {
          openLogin();
        }}
      />
    </HStack>
  );
}
