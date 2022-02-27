import React from "react";

import {
  RootStackScreenProps,
  SettingsStackScreenProps,
} from "../navigation/Links";
import { Button, Page, PageSection, PageTitle, VStack } from "@zerve/ui";
import AppPage from "../components/AppPage";
import { dangerouslyClearAllStorage } from "@zerve/native";
import { FontAwesome } from "@expo/vector-icons";

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
            title="Reset All Local Data"
            onPress={() => {
              dangerouslyClearAllStorage();
            }}
          />
        </VStack>
      </PageSection>
    </AppPage>
  );
}
