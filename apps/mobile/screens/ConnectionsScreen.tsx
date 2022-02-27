import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import {
  Button,
  HStack,
  PageSection,
  PageTitle,
  useColors,
  VStack,
} from "@zerve/ui";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
  RootStackScreenProps,
} from "../navigation/Links";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useConnections } from "../components/Connection";
import { FontAwesome } from "@expo/vector-icons";
import AppPage from "../components/AppPage";

export default function ConnectionsScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, "SettingsStack">
    >();

  const connections = useConnections();
  return (
    <AppPage>
      <PageTitle title="Server Connections" />
      <VStack>
        {connections.map((connection) => (
          <Button
            key={connection.key}
            title={connection.name}
            left={({ color }) => (
              <FontAwesome name="link" color={color} size={24} />
            )}
            onPress={() => {
              navigation.navigate("ConnectionInfo", {
                connection: connection.key,
              });
            }}
          />
        ))}
        <Button
          onPress={() => {
            navigation.navigate("NewConnection");
          }}
          left={({ color }) => (
            <FontAwesome name="plus-circle" color={color} size={24} />
          )}
          primary
          title="New Connection"
        />
      </VStack>
    </AppPage>
  );
}
