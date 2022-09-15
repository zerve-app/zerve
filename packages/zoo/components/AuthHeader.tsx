import {
  useConnection,
  useRequiredConnection,
} from "@zerve/zoo-client/Connection";
import { Button, HStack, Link, ThemedText } from "@zerve/zen";
import { View } from "react-native";
import { useRouter } from "next/router";
import { isSeeminglyAnonUser } from "./Auth";
import { useWebAuthModal } from "../app/AuthWeb";

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
  const openLogin = useWebAuthModal((userId) => {
    push(`/${userId}`);
  });
  const conn = useRequiredConnection();
  const session = conn?.session;
  if (session) {
    const { userLabel, userId } = session;
    const url = `/${userId}`;
    return (
      <Link
        href={url}
        nativePress={() => {
          // not needed because we are on web
        }}
      >
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
          openLogin({ connection: conn.key, path: ["auth"] });
        }}
      />
    </HStack>
  );
}
