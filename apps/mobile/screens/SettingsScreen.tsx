import React from "react";

import { SettingsStackScreenProps } from "../app/Links";
import { Button, PageSection, PageTitle, VStack } from "@zerve/ui";
import AppPage from "../components/AppPage";
import { dangerouslyClearAllStorage } from "@zerve/native";
import { FontAwesome } from "@expo/vector-icons";
import { reloadAsync } from "expo-updates";

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
    </AppPage>
  );
}
