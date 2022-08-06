import { useConnection } from "@zerve/client/Connection";
import { Button, useModal } from "@zerve/zen";
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
        margin: 7,
      }}
    />
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
