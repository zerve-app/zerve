import React from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import { Button, Icon, LinkRowGroup, VStack } from "@zerve/ui";
import { useActionsSheet } from "@zerve/ui-native";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import {
  QueryConnectionProvider,
  useCreateSchema,
  useZNodeValue,
} from "@zerve/query";
import { useConnection } from "../app/Connection";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useStringInput } from "../components/StringInput";
import { displayStoreFileName, prepareStoreFileName } from "@zerve/core";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "ChainSchemas">
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

function ChainSchemasPage({
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
  const openOptions = useActionsSheet(() => []);
  return (
    <VStack>
      <ScreenHeader
        title={"Schemas"}
        isLoading={isLoading}
        corner={<OptionsButton onOptions={openOptions} />}
        onLongPress={openOptions}
      />
      <LinkRowGroup
        links={Object.entries(data || {}).map(([schemaKey, schema]) => {
          return {
            key: schemaKey,
            icon: "crosshairs",
            title: displayStoreFileName(schemaKey),
            onPress: () => {
              navigate("ChainSchema", {
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

export default function ChainSchemasScreen({
  navigation,
  route,
}: HomeStackScreenProps<"ChainSchemas">) {
  const { connection, storePath } = route.params;

  return (
    <ScreenContainer scroll>
      <QueryConnectionProvider value={useConnection(connection)}>
        <ChainSchemasPage connection={connection} storePath={storePath} />
      </QueryConnectionProvider>
    </ScreenContainer>
  );
}
