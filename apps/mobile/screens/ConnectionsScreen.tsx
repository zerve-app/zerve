import React from "react";
import { Button, PageTitle, VStack } from "@zerve/ui";

import { RootStackParamList } from "../app/Links";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useConnections } from "../app/Connection";
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
