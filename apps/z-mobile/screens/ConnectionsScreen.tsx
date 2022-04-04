import React from "react";
import { Button, LinkRow, VStack } from "@zerve/ui";

import { RootStackParamList, SettingsStackParamList } from "../app/Links";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useConnectionsMeta } from "../app/Connection";
import { FontAwesome } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";

export default function ConnectionsScreen() {
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        NativeStackNavigationProp<RootStackParamList, "HomeStack">,
        NativeStackNavigationProp<SettingsStackParamList, "Connections">
      >
    >();

  const connections = useConnectionsMeta();
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
