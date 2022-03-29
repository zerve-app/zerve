import React from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { useActionsSheet } from "@zerve/ui";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import {
  QueryConnectionProvider,
  useDeleteFile,
  useZNode,
  useZNodeValue,
} from "@zerve/query";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { useConnection } from "../app/Connection";
import {
  CompositeNavigationProp,
  NavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "File">
>;

function FilePage({ name }: { name: string }) {
  const { data, isLoading } = useZNodeValue(["Store", "State", name]);
  const navigation = useNavigation<NavigationProp>();
  const deleteFile = useDeleteFile();

  const openOptions = useActionsSheet([
    {
      key: "EditSchema",
      title: "Edit Schema",
      icon: "crosshairs",
      onPress: () => {},
    },
    {
      key: "RawValue",
      title: "Raw Value",
      icon: "code",
      onPress: () => {
        navigation.navigate("RawValue", {
          title: `${name} Value`,
          value: data?.value,
        });
      },
    },
    {
      key: "DeleteFile",
      title: "Delete File",
      icon: "trash",
      danger: true,
      onPress: () => {
        deleteFile.mutate(name);
      },
      onHandled: navigation.goBack,
    },
  ]);
  return (
    <>
      <ScreenHeader
        title={name}
        isLoading={isLoading}
        corner={<OptionsButton onOptions={openOptions} />}
      />
      {data && <JSONSchemaForm value={data.value} schema={data.schema} />}
    </>
  );
}
export default function FileScreen({
  navigation,
  route,
}: HomeStackScreenProps<"File">) {
  const { connection, name } = route.params;

  return (
    <ScreenContainer scroll>
      <QueryConnectionProvider value={useConnection(connection)}>
        <FilePage name={name} />
      </QueryConnectionProvider>
    </ScreenContainer>
  );
}
