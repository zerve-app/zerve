import React from "react";
import {
  Button,
  DisclosureSection,
  HStack,
  IconButton,
  Label,
  PageSection,
  Paragraph,
  useColors,
  VStack,
  LinkRow,
  useBottomSheet,
} from "@zerve/ui";

import { HomeStackParamList, RootStackParamList } from "../app/Links";
import AppPage, { BareAppPage } from "../components/AppPage";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Connection, useConnections } from "../app/Connection";
import { FontAwesome } from "@expo/vector-icons";
import { ZerveLogo } from "../components/ZerveLogo";
import { useDocs } from "@zerve/native";
import { QueryConnectionProvider, useDocList } from "@zerve/query";
import { Icon } from "@zerve/ui/Icon";
import { getZIcon } from "../app/ZIcon";

function SettingsButton({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  return <LinkRow icon="gear" title="Settings" onPress={onPress} />;
}

function LocalDocsSection({}: {}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList, "Home">>();
  const docs = useDocs();
  return (
    <PageSection title="Local Projects">
      <VStack>
        {docs?.map((name) => (
          <LinkRow
            key={name}
            title={name}
            onPress={() => {
              navigation.navigate("Doc", { connection: null, name });
            }}
          />
        ))}
      </VStack>
      <HStack>
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

function ConnectionSection({ connection }: { connection: Connection }) {
  const { data, refetch, isLoading } = useDocList();
  const navigation = useNavigation();
  const { navigate } = useNavigation<NavigationProp>();
  const list = data?.docs?.children;
  const onOptions = useBottomSheet(({ onClose }) => (
    <VStack>
      <Button
        title="Reload"
        onPress={() => {
          refetch();
          onClose();
        }}
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
      isLoading={isLoading}
      header={<Label secondary>{connection.name}</Label>}
      right={
        <IconButton
          altTitle="Options"
          onPress={onOptions}
          icon={(p) => <Icon name="ellipsis-h" {...p} />}
        />
      }
    >
      <VStack>
        {data?.docs?.children?.map((childKey: string) => (
          <LinkRow
            key={childKey}
            title={childKey}
            icon={getZIcon("Container")}
            onPress={() => {
              navigate("ZNode", {
                connection: connection.key,
                path: [childKey],
              });
            }}
          />
        ))}
        {!list?.length && <Paragraph>No Docs loaded..</Paragraph>}
      </VStack>
    </DisclosureSection>
  );
}

export default function HomeScreen({
  navigation,
}: {
  navigation: NavigationProp;
}) {
  const connections = useConnections();
  return (
    <BareAppPage>
      <ZerveLogo />
      <LocalDocsSection />

      {connections.map((connection) => (
        <QueryConnectionProvider key={connection.key} value={connection}>
          <ConnectionSection connection={connection} />
        </QueryConnectionProvider>
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
    </BareAppPage>
  );
}
