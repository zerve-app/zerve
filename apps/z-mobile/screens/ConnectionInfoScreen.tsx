import React from "react";

import { Button, PageSection, Paragraph, Spinner, VStack } from "@zerve/ui";
import { SettingsStackScreenProps } from "../app/Links";
import {
  ConnectionDefinition,
  destroyConnection,
  useConnection,
} from "../app/Connection";
import { FontAwesome } from "@expo/vector-icons";
import { InfoRow } from "@zerve/ui/Row";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import NotFoundScreen from "./NotFoundScreen";
import { useConnectionStatus } from "@zerve/query";

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
  const conn = useConnection(route.params.connection);
  if (!conn) {
    return <NotFoundScreen />;
  }
  return (
    <ScreenContainer scroll>
      <ScreenHeader title={`Connection: ${conn?.name}`} />
      <VStack>
        <ConnectionStatusRow />
        <InfoRow label="URL" value={conn?.url} />
      </VStack>
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
