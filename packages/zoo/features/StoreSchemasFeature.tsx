import React from "react";

import { HomeStackParamList, RootStackParamList } from "../app/Links";
import {
  Button,
  Icon,
  LinkRowGroup,
  VStack,
  useActionsSheet,
} from "@zerve/zen";
import ScreenHeader from "../components/ScreenHeader";
import { useCreateSchema, useZNodeValue } from "@zerve/query";
import { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "../app/useNavigation";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useStringInput } from "../components/StringInput";
import { displayStoreFileName, prepareStoreFileName } from "@zerve/core";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "StoreSchemas">
>;

function CreateSchemaButton({ storePath }: { storePath: string[] }) {
  const createSchema = useCreateSchema(storePath);
  const onOpenNewSchema = useStringInput<void>(() => ({
    onValue: (name) => {
      const formattedName = prepareStoreFileName(name);
      createSchema.mutate(formattedName);
    },
    defaultValue: "",
    inputLabel: "New Schema Name",
  }));
  return (
    <Button
      small
      left={(p) => <Icon name="plus-circle" {...p} />}
      title="Create Schema"
      onPress={() => onOpenNewSchema()}
    />
  );
}

export function StoreSchemasFeature({
  connection,
  storePath,
}: {
  connection: string | null;
  storePath: string[];
}) {
  const { data, isLoading } = useZNodeValue([
    ...storePath,
    "State",
    "$schemas",
  ]);
  const { navigate } = useNavigation<NavigationProp>();
  const [optionsButton, openOptions] = useActionsSheet(
    (onOpen) => <OptionsButton onOptions={onOpen} />,
    () => []
  );
  return (
    <VStack>
      <ScreenHeader
        title={"Schemas"}
        isLoading={isLoading}
        corner={optionsButton}
        onLongPress={openOptions}
      />
      <LinkRowGroup
        links={Object.entries(data || {}).map(([schemaKey, schema]) => {
          return {
            key: schemaKey,
            icon: "crosshairs",
            title: displayStoreFileName(schemaKey),
            onPress: () => {
              navigate("StoreSchema", {
                connection,
                schema: schemaKey,
                storePath,
              });
            },
          };
        })}
      />
      <CreateSchemaButton storePath={storePath} />
    </VStack>
  );
}
