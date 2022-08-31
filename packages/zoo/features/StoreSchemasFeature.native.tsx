import {
  Button,
  Icon,
  LinkRowGroup,
  VStack,
  useActionsSheet,
} from "@zerve/zen";
import ScreenHeader from "../components/ScreenHeader";
import { useZNodeValue } from "@zerve/zoo-client/Query";
import { useCreateSchema } from "@zerve/zoo-client/Mutation";
import {
  useConnectionNavigation,
  useStoreNavigation,
} from "../app/useNavigation";
import { OptionsButton } from "../components/OptionsButton";
import { displayStoreFileName, prepareStoreFileName } from "@zerve/zed";
import { useTextInputFormModal } from "@zerve/zen/TextInputFormModal";

function CreateSchemaButton({ storePath }: { storePath: string[] }) {
  const createSchema = useCreateSchema(storePath);
  const onOpenNewSchema = useTextInputFormModal<void>(() => ({
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

export function StoreSchemasFeature({ storePath }: { storePath: string[] }) {
  const { data, isLoading } = useZNodeValue([
    ...storePath,
    "State",
    "$schemas",
  ]);

  const { backToZ } = useConnectionNavigation();
  const { openSchema } = useStoreNavigation();
  const [optionsButton, openOptions] = useActionsSheet(
    (onOpen) => <OptionsButton onOptions={onOpen} />,
    () => [],
  );

  return (
    <>
      <ScreenHeader
        title={"Schemas"}
        isLoading={isLoading}
        corner={optionsButton}
        onLongPress={openOptions}
        onBack={() => {
          backToZ(storePath);
        }}
      />
      <VStack padded>
        <LinkRowGroup
          links={Object.entries(data || {}).map(([schemaKey, schema]) => {
            return {
              key: schemaKey,
              icon: "crosshairs",
              title: displayStoreFileName(schemaKey),
              onPress: () => {
                openSchema(schemaKey);
              },
            };
          })}
        />
        <CreateSchemaButton storePath={storePath} />
      </VStack>
    </>
  );
}
