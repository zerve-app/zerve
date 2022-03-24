import React, { useState } from "react";

import { SettingsStackScreenProps } from "../app/Links";
import {
  Button,
  PageSection,
  PageTitle,
  VStack,
  LinkRow,
  AsyncButton,
} from "@zerve/ui";
import AppPage from "../components/AppPage";
import { dangerouslyClearAllStorage } from "@zerve/native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  checkForUpdateAsync,
  fetchUpdateAsync,
  manifest,
  releaseChannel,
  reloadAsync,
  UpdateCheckResult,
  updateId,
} from "expo-updates";
import { InfoRow } from "@zerve/ui/Row";
import { Icon } from "@zerve/ui/Icon";
import { useNavigation } from "@react-navigation/native";

function AppUpdater() {
  const [update, setUpdate] = useState<null | UpdateCheckResult>(null);
  return (
    <>
      <AsyncButton
        title="Check for Updates"
        onPress={async () => {
          const update = await checkForUpdateAsync();
          alert(JSON.stringify(update));
          setUpdate(update);
        }}
      />
      <AsyncButton
        title="Update App"
        onPress={async () => {
          const updateApp = await fetchUpdateAsync();
          if (!updateApp.isNew) {
            alert("Already up to date.");
            return;
          }
          await reloadAsync();
        }}
      />
      {update && (
        <InfoRow label="Update Available" value={JSON.stringify(update)} />
      )}
    </>
  );
}

export default function SettingsScreen({
  navigation,
}: SettingsStackScreenProps<"Settings">) {
  const { navigate } = useNavigation();
  return (
    <AppPage>
      <PageTitle title="App Settings" />
      <VStack>
        <LinkRow
          title="Server Connections"
          icon="link"
          onPress={() => {
            navigation.navigate("Connections");
          }}
        />
      </VStack>
      <PageSection title="Internal Features">
        <VStack>
          <LinkRow
            title="Kitchen Sink"
            icon="shower"
            onPress={() => {
              navigation.navigate("KitchenSink");
            }}
          />
        </VStack>
      </PageSection>
      <PageSection title="Local Data">
        <VStack>
          <Button
            title="Export Local Database"
            right={({ color }) => (
              <FontAwesome name="upload" color={color} size={24} />
            )}
            onPress={() => {}}
          />
          <Button
            right={({ color }) => (
              <FontAwesome name="download" color={color} size={24} />
            )}
            title="Import Local Database"
            onPress={() => {}}
          />
          <Button
            right={({ color }) => (
              <FontAwesome name="refresh" color={color} size={24} />
            )}
            title="Run Garbage Collection"
            onPress={() => {}}
          />
          <Button
            title="Reset All Local Data"
            right={({ color }) => (
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
          <AppUpdater />

          <Button
            title="Raw Manifest"
            left={(p) => <MaterialCommunityIcons {...p} name="code-json" />}
            onPress={() => {
              navigate("RawValue", {
                title: `App Manifest`,
                value: manifest,
              });
            }}
          />
          <InfoRow label="Release Channel" value={releaseChannel} />
          <InfoRow label="Update ID" value={updateId || "?"} />
          <Button
            title="Restart App"
            right={(p) => <Icon {...p} name="refresh" />}
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
