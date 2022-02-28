import React from "react";
import { StyleSheet } from "react-native";
import {
  Button,
  HStack,
  IconButton,
  PageSection,
  PageTitle,
  useColors,
  VStack,
} from "@zerve/ui";

import { HomeStackParamList, RootStackParamList } from "../navigation/Links";
import AppPage from "../components/AppPage";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Connection, useConnections } from "../components/Connection";
import { FontAwesome } from "@expo/vector-icons";
import { ZerveLogo } from "../components/ZerveLogo";
import { useDocs } from "@zerve/native";

function SettingsButton({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  return (
    <Button
      left={<FontAwesome name="gear" size={24} color={colors.text} />}
      title="Settings"
      onPress={onPress}
    />
  );
}

function LocalDocsSection({}: {}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList, "Home">>();
  const docs = useDocs();
  return (
    <PageSection title="Local Projects">
      <HStack>
        {docs?.map((name) => (
          <Button key={name} title={name} onPress={() => {}} />
        ))}
        <Button
          onPress={() => {
            navigation.navigate("NewDoc");
          }}
          title="New Project"
          left={({ color }) => (
            <FontAwesome name="plus-circle" color={color} size={24} />
          )}
        />
        <Button
          left={({ color }) => (
            <FontAwesome name="download" color={color} size={24} />
          )}
          onPress={() => {}}
          title="Add Files"
        />
      </HStack>
    </PageSection>
  );
}

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "Home">
>;

function ConnectionSection({
  connection,
  navigation,
}: {
  connection: Connection;
  navigation: NavigationProp;
}) {
  return (
    <PageSection
      title={connection.name}
      right={
        <IconButton
          altTitle="Connection Info"
          icon={(props) => <FontAwesome name="info-circle" {...props} />}
          onPress={() =>
            navigation.navigate("SettingsStack", {
              screen: "ConnectionInfo",
              params: { connection: connection.key },
            })
          }
        />
      }
    >
      <VStack>{null}</VStack>
    </PageSection>
  );
}

export default function HomeScreen({
  navigation,
}: {
  navigation: NavigationProp;
}) {
  const connections = useConnections();
  return (
    <AppPage>
      <ZerveLogo />
      <LocalDocsSection />

      {connections.map((connection) => (
        <ConnectionSection
          navigation={navigation}
          connection={connection}
          key={connection.key}
        />
      ))}

      <HStack>
        <SettingsButton
          onPress={() => {
            navigation.navigate("SettingsStack", {
              screen: "Settings",
            });
          }}
        />
      </HStack>
    </AppPage>
  );
}
