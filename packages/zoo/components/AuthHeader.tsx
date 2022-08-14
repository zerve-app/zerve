import { useConnection } from "@zerve/client/Connection";
import { Button, HStack, Link, ThemedText, useModal } from "@zerve/zen";
import { Text, View } from "react-native";
import { LoginForm } from "./Auth";

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
  const openLogin = useModal<void>(({ onClose }) => (
    <LoginForm path={["Auth"]} authMeta={{}} onComplete={onClose} />
  ));
  const conn = useConnection();
  const userId = conn?.session?.userLabel;
  if (!userId) return null;
  const url = `/${userId}`;
  if (conn?.session) {
    return (
      <Link href={url}>
        <View style={{ flexDirection: "row" }}>
          <ThemedText
            style={{ alignSelf: "center", fontWeight: "bold", fontSize: 16 }}
          >
            {conn.session.userLabel}
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
