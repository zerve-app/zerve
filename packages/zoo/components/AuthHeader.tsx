import { useConnection } from "@zerve/client/Connection";
import { Button, Link, useModal } from "@zerve/zen";
import { Text, View } from "react-native";
import { LoginForm } from "./Auth";

function UserProfileIcon() {
  const conn = useConnection();
  const userId = conn?.session?.userId;
  if (!userId) return null;
  const url = `/${userId}`;
  return (
    <Link href={url}>
      <View
        style={{
          height: 36,
          width: 36,
          backgroundColor: "#222",
          borderRadius: 18,
          margin: 7,
        }}
      />
    </Link>
  );
}

export function AuthHeader() {
  const conn = useConnection();
  const openLogin = useModal<void>(({ onClose }) => (
    <LoginForm path={["Auth"]} authMeta={{}} onComplete={onClose} />
  ));
  if (conn?.session) {
    return (
      <>
        <Text>{conn.session.userLabel}</Text>
        <UserProfileIcon />
      </>
    );
  }
  return (
    <Button
      title="Log In / Register"
      onPress={() => {
        openLogin();
      }}
    />
  );
}
