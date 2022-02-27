import React from "react";

import {
  Button,
  Input,
  Page,
  PageSection,
  PageTitle,
  Paragraph,
  Separator,
  VStack,
} from "@zerve/ui";
import AppPage from "../components/AppPage";
import { SettingsStackScreenProps } from "../navigation/Links";
import { destroyConnection, useConnection } from "../components/Connection";
import { FontAwesome } from "@expo/vector-icons";

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
        <Input label="URL" value={conn?.url} disabled />
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
