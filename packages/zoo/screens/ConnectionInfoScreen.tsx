import React from "react";

import {
  AsyncButton,
  Button,
  PageSection,
  Paragraph,
  Spinner,
  VStack,
} from "@zerve/zen";
import { SettingsStackScreenProps } from "../app/Links";
import {
  destroyConnection,
  useSavedConnection,
  setSession,
  useConnectionStatus,
  logout,
} from "../app/ConnectionStorage";
import { FontAwesome } from "@expo/vector-icons";
import { InfoRow } from "@zerve/zen/Row";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import NotFoundScreen from "./NotFoundScreen";

export function ConnectionStatusRow({}: {}) {
  const { isConnected } = useConnectionStatus();
  return (
    <InfoRow
      label="Status"
      value={
        isConnected
          ? "🟢 Connected"
          : // : isReachable
            // ? "🟠 Reachable"
            "🔴 Not Connected"
      }
    >
      {/* {isLoading && <Spinner />} */}
    </InfoRow>
  );
}

export default function ConnectionInfoScreen({
  navigation,
  route,
}: SettingsStackScreenProps<"ConnectionInfo">) {
  const conn = useSavedConnection(route.params.connection);
  if (!conn) {
    return <NotFoundScreen />;
  }
  const session = conn?.session;
  return (
    <ScreenContainer scroll>
      <ScreenHeader title={`Connection: ${conn?.name}`} />
      <VStack>
        <ConnectionStatusRow />
        <InfoRow label="URL" value={conn?.url} />
      </VStack>
      {session && (
        <PageSection title="Session">
          <VStack>
            <InfoRow label="Identity" value={session.userLabel} />
            <AsyncButton
              title="Log Out"
              onPress={async () => {
                await logout(conn, session);
              }}
            />
          </VStack>
        </PageSection>
      )}
      <PageSection title="Delete Connection">
        <VStack>
          <Paragraph>
            Delete connection to this server. This is dangerous, but you can
            re-add it later.
          </Paragraph>

          <Button
            onPress={() => {
              destroyConnection(route.params.connection);
              navigation.goBack();
            }}
            danger
            left={({ color }) => (
              <FontAwesome name="trash" color={color} size={24} />
            )}
            title="Delete Server Connection"
          />
        </VStack>
      </PageSection>
    </ScreenContainer>
  );
}
