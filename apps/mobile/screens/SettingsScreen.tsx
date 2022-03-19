import React from "react";

import { SettingsStackScreenProps } from "../app/Links";
import { Button, PageSection, PageTitle, VStack } from "@zerve/ui";
import AppPage from "../components/AppPage";
import { dangerouslyClearAllStorage } from "@zerve/native";
import { FontAwesome } from "@expo/vector-icons";
import { manifest, releaseChannel, reloadAsync, updateId } from "expo-updates";
import { InfoRow } from "@zerve/ui/Row";

function NeedUpdateRow() {
  return <InfoRow label="Update" value={JSON.stringify(manifest)} />;
}

export default function SettingsScreen({
  navigation,
}: SettingsStackScreenProps<"Settings">) {
  // const { goBack } = useNavigation();
  return (
    <AppPage>
      <PageTitle title="App Settings" />
      <VStack>
        <Button
          title="Server Connections"
          left={({ color }) => (
            <FontAwesome name="link" color={color} size={24} />
          )}
          onPress={() => {
            navigation.navigate("Connections");
          }}
        />
      </VStack>
      <PageSection title="Internal Features">
        <VStack>
          <Button
            title="Kitchen Sink"
            onPress={() => {
              navigation.navigate("KitchenSink");
            }}
            left={({ color }) => (
              <FontAwesome name="shower" color={color} size={24} />
            )}
          />
        </VStack>
      </PageSection>
      <PageSection title="Local Data">
        <VStack>
          <Button title="Export Local Database" onPress={() => {}} />
          <Button title="Import Local Database" onPress={() => {}} />
          <Button
            left={({ color }) => (
              <FontAwesome name="trash" color={color} size={24} />
            )}
            title="Run Garbage Collection"
            onPress={() => {}}
          />
          <Button
            title="Reset All Local Data"
            left={({ color }) => (
              <FontAwesome name="trash" color={color} size={24} />
            )}
            danger
            onPress={() => {
              dangerouslyClearAllStorage();
              reloadAsync().then(() => {
                alert("App has been reset.");
              });
            }}
          />
        </VStack>
      </PageSection>
      <PageSection title="App Info / Version">
        <VStack>
          <NeedUpdateRow />
          <InfoRow label="Mainifest" value={JSON.stringify(manifest)} />
          <InfoRow label="Release Channel" value={releaseChannel} />
          <InfoRow label="Update ID" value={updateId || "?"} />
          <Button
            title="Restart"
            onPress={() => {
              reloadAsync()
                .then(() => {})
                .catch((e) => {});
            }}
          />
        </VStack>
      </PageSection>
    </AppPage>
  );
}
