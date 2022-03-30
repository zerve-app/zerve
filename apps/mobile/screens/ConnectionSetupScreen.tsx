import React from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { LinkRowGroup, useActionsSheet, VStack } from "@zerve/ui";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { QueryConnectionProvider, useZNodeValue } from "@zerve/query";
import { useConnection } from "../app/Connection";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "ConnectionSetup">
>;

function ConnectionSetupPage({ connection }: { connection: string | null }) {
  const { navigate } = useNavigation<NavigationProp>();
  return (
    <>
      <ScreenHeader title="Connection Setup" />
      <VStack>
        <LinkRowGroup
          links={[
            {
              key: "info",
              title: "Connection Info",
              icon: "link",
              onPress: () => {
                navigate("SettingsStack", {
                  screen: "ConnectionInfo",
                  params: { connection },
                });
              },
            },
            {
              key: "api",
              title: "Dynamic API",
              icon: "code",
              onPress: () => {
                navigate("ZNode", {
                  connection,
                  path: [],
                });
              },
            },
          ]}
        />
      </VStack>
    </>
  );
}

export default function ConnectionSetupScreen({
  navigation,
  route,
}: HomeStackScreenProps<"ConnectionSetup">) {
  const { connection } = route.params;

  return (
    <ScreenContainer scroll>
      <QueryConnectionProvider value={useConnection(connection)}>
        <ConnectionSetupPage connection={connection} />
      </QueryConnectionProvider>
    </ScreenContainer>
  );
}
