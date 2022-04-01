import React, { useState } from "react";

import { SettingsStackScreenProps } from "../app/Links";
import { Button, PageSection, VStack, LinkRow, AsyncButton } from "@zerve/ui";
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
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { clearLocalHistoryStorage } from "../app/History";
import { showToast } from "@zerve/ui";

function AppUpdater() {
  const [update, setUpdate] = useState<null | UpdateCheckResult>(null);
  return (
    <>
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
        left={(p) => <Icon name="download" {...p} />}
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
    <ScreenContainer scroll>
      <ScreenHeader title="App Settings" backButtonCancelStyle />
      <VStack>
        <LinkRow
          title="Server Connections"
          icon="link"
          onPress={() => {
            navigation.navigate("Connections");
          }}
        />
      </VStack>
      <PageSection title="Dev Features">
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
          {/* <Button
            title="Export Local Database"
            left={({ color }) => (
              <FontAwesome name="upload" color={color} size={24} />
            )}
            onPress={() => {}}
          />
          <Button
            left={({ color }) => (
              <FontAwesome name="download" color={color} size={24} />
            )}
            title="Import Local Database"
            onPress={() => {}}
          />
          <Button
            left={({ color }) => (
              <FontAwesome name="refresh" color={color} size={24} />
            )}
            title="Run Garbage Collection"
            onPress={() => {}}
          /> */}
          <AsyncButton
            title="Clear Local History"
            left={({ color }) => (
              <FontAwesome name="trash" color={color} size={24} />
            )}
            danger
            onPress={async () => {
              await clearLocalHistoryStorage();
              showToast("Local History Cleared");
            }}
          />
          <Button
            title="Reset All Local Data"
            left={({ color }) => (
              <FontAwesome name="trash" color={color} size={24} />
            )}
            danger
            onPress={() => {
              // dangerouslyClearAllStorage();
              // reloadAsync().then(() => {
              showToast("data reset not working right now.");
              // });
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
            left={(p) => <Icon {...p} name="refresh" />}
            onPress={() => {
              reloadAsync()
                .then(() => {})
                .catch((e) => {});
            }}
          />
        </VStack>
      </PageSection>
    </ScreenContainer>
  );
}
