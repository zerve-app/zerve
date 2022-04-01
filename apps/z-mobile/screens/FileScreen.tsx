import React from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { useActionsSheet } from "@zerve/ui-native";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import {
  QueryConnectionProvider,
  useDeleteFile,
  useSaveFile,
  useZNodeValue,
} from "@zerve/query";
import { useConnection } from "../app/Connection";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { showToast } from "../app/Toast";
import { FileEditor } from "../components/FileEditor";
import { displayStoreFileName } from "@zerve/core";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "File">
>;

function FilePage({
  name,
  connection,
}: {
  name: string;
  connection: string | null;
}) {
  const { data, isLoading } = useZNodeValue(["Store", "State", name]);
  const navigation = useNavigation<NavigationProp>();
  const deleteFile = useDeleteFile();
  const saveFile = useSaveFile();
  const openOptions = useActionsSheet(() => [
    {
      key: "EditSchema",
      title: "Edit Schema",
      icon: "crosshairs",
      onPress: () => {
        navigation.navigate("FileSchema", {
          name,
          connection,
        });
      },
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
  console.log("filescreen", data);
  return (
    <>
      <ScreenHeader
        title={displayStoreFileName(name)}
        isLoading={isLoading}
        corner={<OptionsButton onOptions={openOptions} />}
        onLongPress={openOptions}
      />
      {data && (
        <FileEditor
          onValue={async (value) => {
            await saveFile.mutateAsync({ name, value });
            showToast("File has been updated.");
          }}
          value={data.value}
          schema={data.schema}
        />
      )}
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
        <FilePage name={name} connection={connection} />
      </QueryConnectionProvider>
    </ScreenContainer>
  );
}
