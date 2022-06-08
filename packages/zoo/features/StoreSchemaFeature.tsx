import React, { useMemo } from "react";

import { useActionsSheet, VStack } from "@zerve/zen";
import ScreenHeader from "../components/ScreenHeader";
import { useDeleteSchema, useSaveSchema } from "@zerve/client/Mutation";
import { useZNodeValue, useZStoreJSONSchema } from "@zerve/client/Query";
import {
  useGlobalNavigation,
  useStoreSchemaNavigation,
} from "../app/useNavigation";
import { OptionsButton } from "../components/OptionsButton";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { displayStoreFileName } from "@zerve/core";
import { showToast } from "@zerve/zen/Toast";

export function StoreSchemaFeature({
  schema,
  storePath,
}: {
  schema: string;
  storePath: string[];
}) {
  const { data, isLoading } = useZNodeValue([
    ...storePath,
    "State",
    "$schemas",
    schema,
  ]);
  const {
    data: fullSchema,
    isError,
    isLoading: isSLoading,
  } = useZStoreJSONSchema(storePath);
  const saveSchema = useSaveSchema(storePath);
  const deleteSchema = useDeleteSchema(storePath);
  const { openRawJSON } = useGlobalNavigation();
  const { leave } = useStoreSchemaNavigation(storePath, schema);
  const [optionsButton, openOptions] = useActionsSheet(
    (onOpen) => <OptionsButton onOptions={onOpen} />,
    () => [
      {
        key: "RawValue",
        title: "Raw Schema Value",
        icon: "code",
        onPress: () => {
          openRawJSON(`${schema} Value`, data);
        },
      },
      {
        key: "Delete",
        title: "Delete Schema",
        icon: "trash",
        danger: true,
        onPress: () => {
          deleteSchema.mutate({ schemaName: schema });
          leave();
        },
      },
    ]
  );
  return (
    <VStack>
      <ScreenHeader
        title={`${displayStoreFileName(schema)} Schema`}
        isLoading={isLoading}
        corner={optionsButton}
        onLongPress={openOptions}
        onBack={leave}
      />
      <JSONSchemaForm
        id={`$schemas/${schema}`}
        onValue={async (v) => {
          await saveSchema.mutateAsync({ schemaName: schema, schema: v });
          showToast("Schema has been updated.");
          leave();
        }}
        saveLabel="Save Schema"
        value={data}
        schema={fullSchema}
      />
    </VStack>
  );
}
