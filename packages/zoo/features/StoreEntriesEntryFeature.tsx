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
  ThemedText,
  Title,
  useAsyncHandler,
  VSpaced,
  VStack,
} from "@zerve/zen";
import { memo, useCallback, useMemo } from "react";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { FeaturePane, NavLink } from "../web/Dashboard";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { useCreateEntry, useSaveEntry } from "@zerve/client/Mutation";
import {
  StoreFeatureLinkButton,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import { useStoreNavigation } from "../app/useNavigation";
import { useZNodeValue, useZStoreSchemas } from "@zerve/client/Query";
import { JSONSchemaEditorContext } from "../components/JSONSchemaEditor";

const EntryNameSchema = {
  type: "string",
  title: "Entry Name",
} as const;

function EntryContent({
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

  const editorContext = useMemo(() => {
    return {
      OverrideFieldComponents: {
        "https://type.zerve.link/HumanText": () => (
          <ThemedText>Hello human</ThemedText>
        ),
      },
    };
  }, []);

  return (
    <JSONSchemaEditorContext.Provider value={editorContext}>
      <JSONSchemaForm
        id={`entry-${path.join("-")}`}
        onValue={onValue}
        value={value}
        schema={schema}
        schemaStore={schemaStore}
        padded
      />
    </JSONSchemaEditorContext.Provider>
  );
}

function StoreEntriesEntry({
  storePath,
  location,
  path,
  title,
}: StoreFeatureProps & { path: Array<string> }) {
  const saveEntry = useSaveEntry(storePath);
  const schemas = useZStoreSchemas(storePath);
  const entry = useZNodeValue([...storePath, "State", path[0]]);
  return (
    <FeaturePane
      title={title}
      spinner={saveEntry.isLoading || schemas.isFetching || entry.isFetching}
    >
      {entry.data && schemas.data ? (
        <EntryContent
          path={path}
          onValue={async (value) => {
            saveEntry.mutate({ name: path[0], value });
          }}
          value={entry.data.value}
          schema={entry.data.schema}
          schemaStore={schemas.data}
        />
      ) : null}
    </FeaturePane>
  );
}

export const StoreEntriesEntryFeature = memo(StoreEntriesEntry);
