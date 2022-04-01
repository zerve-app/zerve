import React from "react";
import { Button, LinkRow, PageTitle, VStack } from "@zerve/ui";

import { RootStackParamList } from "../app/Links";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useConnections } from "../app/Connection";
import { FontAwesome } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";

export default function ConnectionsScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, "SettingsStack">
    >();

  const connections = useConnections();
  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Server Connections" />
      <VStack>
        {connections.map((connection) => (
          <LinkRow
            key={connection.key}
            title={connection.name}
            icon="link"
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
    </ScreenContainer>
  );
}
