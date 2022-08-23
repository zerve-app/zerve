import { useConnection, useRequiredConnection } from "@zerve/client/Connection";
import { postZAction } from "@zerve/client/ServerCalls";
import {
  AllJSONSchemaType,
  EmptySchemaStore,
  prepareStoreFileName,
  SchemaStore,
} from "@zerve/core";
import {
  Label,
  showToast,
  Title,
  useAsyncHandler,
  VSpaced,
  JSONSchemaForm,
  VStack,
} from "@zerve/zen";
import { memo, useCallback, useMemo } from "react";
import { FeaturePane, NavLink } from "../web/Dashboard";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";
import {
  useCreateEntry,
  useSaveEntry,
  useSaveSchema,
} from "@zerve/client/Mutation";
import {
  StoreFeatureLinkButton,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import { useStoreNavigation } from "../app/useNavigation";
import {
  connectionSchemasToZSchema,
  useZNodeValue,
  useZStoreJSONSchema,
  useZStoreSchemas,
} from "@zerve/client/Query";

const EntryNameSchema = {
  type: "string",
  title: "Entry Name",
} as const;

function SchemaContent({
  value,
  schema,
  schemaStore,
  path,
  onValue,
}: {
  value: any;
  schema: AllJSONSchemaType;
  schemaStore: SchemaStore;
  onValue: (v: any) => Promise<void>;
  path: Array<string>;
}) {
  if (schema.type === "null")
    return (
      <VStack padded>
        <VSpaced space={4}>
          <Title
            secondary
            style={{ textAlign: "center" }}
            title="This Entry is Empty"
          />
        </VSpaced>
        <Label>You can modify the schema here:</Label>
        <StoreFeatureLinkButton
          title="Set Schema"
          icon="crosshairs"
          to={{
            key: "entries",
            path,
            child: "schema",
          }}
        />
      </VStack>
    );

  return (
    <JSONSchemaForm
      id={`entry-${path.join("-")}`}
      onValue={onValue}
      value={value}
      schema={schema}
      schemaStore={schemaStore}
      padded
    />
  );
}

function StoreSchemasSchema({
  storePath,
  location,
  schema: schemaName,
  title,
}: StoreFeatureProps & { schema: string }) {
  const schemas = useZStoreJSONSchema(storePath);
  const schemaQuery = useZNodeValue([
    ...storePath,
    "State",
    "$schemas",
    schemaName,
  ]);
  const saveSchema = useSaveSchema(storePath);
  return (
    <FeaturePane
      title={title}
      spinner={
        saveSchema.isLoading || schemas.isFetching || schemaQuery.isFetching
      }
    >
      {schemaQuery.data && schemas.data ? (
        <JSONSchemaForm
          id={`file-schema-${schemaName}`}
          saveLabel="Save Schema"
          value={schemaQuery.data}
          onValue={async (schemaValue) => {
            await saveSchema.mutateAsync({
              schemaName,
              schema: schemaValue,
            });
            showToast("Schema has been updated.");
          }}
          schema={schemas.data}
          // schemaStore={storeSchemas}
          padded
        />
      ) : null}
    </FeaturePane>
  );
}

export const StoreSchemasSchemaFeature = memo(StoreSchemasSchema);
