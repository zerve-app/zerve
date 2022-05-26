import ScreenHeader from "../components/ScreenHeader";
import { useSaveFileSchema } from "@zerve/client/Mutation";
import {
  connectionSchemasToZSchema,
  useZStoreSchemas,
  useZNodeValue,
} from "@zerve/client/Query";
import { useNavigation } from "@react-navigation/native";
import { OptionsButton } from "../components/OptionsButton";
import { JSONSchemaEditor } from "../components/JSONSchemaEditor";
import { displayStoreFileName } from "@zerve/core";
import { showToast } from "@zerve/zen/Toast";
import { useMemo } from "react";
import {
  useConnectionNavigation,
  useGlobalNavigation,
  useStoreFileNavigation,
  useStoreNavigation,
} from "../app/useNavigation";
import { useActionsSheet } from "@zerve/zen";

export function StoreFileSchemaFeature({
  name,
  storePath,
}: {
  name: string;
  storePath: string[];
}) {
  const { data, isLoading } = useZNodeValue([...storePath, "State", name]);

  const { data: schemaStore } = useZStoreSchemas(storePath);

  const fullSchema = useMemo(() => {
    return connectionSchemasToZSchema(schemaStore);
  }, [schemaStore]);

  const { openRawJSON } = useGlobalNavigation();
  const { backTo } = useStoreFileNavigation(storePath, name);
  const saveSchema = useSaveFileSchema(storePath, schemaStore);

  const [optionsButton, openOptions] = useActionsSheet(
    (onOpen) => <OptionsButton onOptions={onOpen} />,
    () => [
      {
        key: "RawValue",
        title: "Raw Schema Value",
        icon: "code",
        onPress: () => {
          openRawJSON(`${name} Value`, data?.schema);
        },
      },
    ]
  );
  return (
    <>
      <ScreenHeader
        title={`${displayStoreFileName(name)} Schema`}
        isLoading={isLoading}
        corner={optionsButton}
        onLongPress={openOptions}
        onBack={backTo}
      />
      {data && !isLoading && (
        <JSONSchemaEditor
          saveLabel="Save Schema"
          value={data?.schema}
          onValue={async (schema) => {
            await saveSchema.mutateAsync({ name, schema });
            showToast("Schema has been updated.");
          }}
          schema={fullSchema}
        />
      )}
    </>
  );
}
