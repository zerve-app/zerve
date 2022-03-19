import React, { useEffect, useState } from "react";

import {
  Button,
  Input,
  Page,
  PageSection,
  PageTitle,
  Paragraph,
  Separator,
  Spinner,
  VStack,
} from "@zerve/ui";
import AppPage from "../components/AppPage";
import { SettingsStackScreenProps } from "../app/Links";
import {
  Connection,
  destroyConnection,
  useConnection,
} from "../app/Connection";
import { FontAwesome } from "@expo/vector-icons";
import { InfoRow } from "@zerve/ui/Row";

function useConnectionStatus(connection: Connection) {
  let [isConnected, setIsConnected] = useState(false);
  let [isLoading, setIsLoading] = useState(true);

  function doUpdateStatus(connectionUrl: string) {
    setIsLoading(true);
    fetch(connectionUrl)
      .then((resp) => {
        setIsConnected(resp.status === 200);
      })
      .catch((e) => {
        setIsConnected(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    doUpdateStatus(connection.url);
    const updateStatusInterval = setInterval(() => {
      doUpdateStatus(connection.url);
    }, 5000);
    return () => {
      clearInterval(updateStatusInterval);
    };
  }, [connection.url]);
  return { isConnected, isLoading };
}

function ConnectionStatusRow({ connection }: { connection: Connection }) {
  const { isConnected, isLoading } = useConnectionStatus(connection);
  return (
    <InfoRow
      label="Status"
      value={isConnected ? "🟢 Connected" : "🔴 Not Connected"}
    >
      {isLoading && <Spinner />}
    </InfoRow>
  );
}

export default function ConnectionInfoScreen({
  navigation,
  route,
}: SettingsStackScreenProps<"ConnectionInfo">) {
  const conn = useConnection(route.params.connection);
  if (!conn) return <AppPage>{null}</AppPage>;
  return (
    <AppPage>
      <PageTitle title={`Connection: ${conn?.name}`} />
      <VStack>
        <ConnectionStatusRow connection={conn} />

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
    </AppPage>
  );
}
