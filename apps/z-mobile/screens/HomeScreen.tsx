import React, { useState } from "react";
import {
  Button,
  DisclosureSection,
  HStack,
  IconButton,
  Label,
  VStack,
  LinkRow,
  LinkRowGroup,
  ActionButtonDef,
  ActionButton,
  ThemedText,
} from "@zerve/ui";

import { HomeStackParamList, RootStackParamList } from "../app/Links";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ConnectionDefinition, useConnectionsMeta } from "../app/Connection";
import { FontAwesome } from "@expo/vector-icons";
import { ZerveLogo } from "../components/ZerveLogo";
import { useDocs } from "@zerve/native";
import { QueryConnectionProvider, useConnectionStatus } from "@zerve/query";
import { Icon } from "@zerve/ui/Icon";
import { getDocumentAsync } from "expo-document-picker";
import ScreenContainer from "../components/ScreenContainer";
import {
  ConnectionHome,
  ConnectionMetaLinks,
  ConnectionProjects,
  NewFileButton,
} from "./ConnectionScreen";
import { useBottomSheet } from "@zerve/ui-native";

function LocalDocsSection({}: {}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList, "Home">>();
  const docs = useDocs();
  return (
    <DisclosureSection header={<Label>Local Projects</Label>}>
      <VStack>
        <LinkRowGroup
          links={docs?.map((name) => ({
            key: name,
            title: name,
            icon: "briefcase",
            onPress: () => {
              navigation.navigate("File", { connection: null, name });
            },
          }))}
        />
      </VStack>
      <HStack>
        <Button
          onPress={() => {
            navigation.navigate("NewFile", { connection: null });
          }}
          title="New File"
          left={({ color }) => (
            <FontAwesome name="plus-circle" color={color} size={24} />
          )}
        />
        <Button
          left={({ color }) => (
            <FontAwesome name="download" color={color} size={24} />
          )}
          onPress={() => {
            getDocumentAsync({}).then();
          }}
          title="Add Files"
        />
      </HStack>
    </DisclosureSection>
  );
}

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "Home">
>;

function ConnectionSection({
  connection,
}: {
  connection: ConnectionDefinition;
}) {
  const [actions, setActions] = useState<ActionButtonDef[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const { isConnected } = useConnectionStatus();
  const onOptions = useBottomSheet<void>(({ onClose }) => (
    <VStack>
      {actions.map((action) => (
        <ActionButton
          key={action.key}
          action={{ ...action, onHandled: onClose }}
        />
      ))}
      <LinkRow
        icon="database"
        onPress={() => {
          navigation.navigate("Connection", {
            connection: connection.key,
          });
          onClose();
        }}
        title={`Open ${connection.name}`}
      />
      <LinkRow
        title="Connection Info"
        icon="link"
        onPress={() => {
          navigation.navigate("SettingsStack", {
            screen: "ConnectionInfo",
            params: { connection: connection.key },
          });
          onClose();
        }}
      />
    </VStack>
  ));
  return (
    <DisclosureSection
      header={<Label>{connection.name}</Label>}
      right={
        <>
          <IconButton
            altTitle="Options"
            onPress={onOptions}
            icon={(p) => <Icon name="ellipsis-h" {...p} />}
          />
          <ThemedText>{isConnected ? "🟢" : "🔴"}</ThemedText>
        </>
      }
    >
      <VStack>
        <ConnectionHome onActions={setActions} />
        <ConnectionMetaLinks connection={connection} />
      </VStack>
    </DisclosureSection>
  );
}

export default function HomeScreen({
  navigation,
}: {
  navigation: NavigationProp;
}) {
  const connections = useConnectionsMeta();
  return (
    <ScreenContainer scroll safe>
      <ZerveLogo />
      {connections.map((connection) => (
        <QueryConnectionProvider key={connection.key} value={connection}>
          <ConnectionSection connection={connection} />
        </QueryConnectionProvider>
      ))}
      <LocalDocsSection />
      <VStack>
        <LinkRowGroup
          links={[
            {
              key: "History",
              title: "Local History",
              icon: "history",
              onPress: () => {
                navigation.navigate("History");
              },
            },
            {
              key: "AppSettings",
              title: "App Settings",
              icon: "gear",
              onPress: () => {
                navigation.navigate("SettingsStack", {
                  screen: "Settings",
                });
              },
            },
          ]}
        />
      </VStack>
    </ScreenContainer>
  );
}
