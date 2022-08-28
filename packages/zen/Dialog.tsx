import {
  getDefaultSchemaValue,
  JSONSchema,
  FromSchema,
  EmptySchemaStore,
  NullSchema,
  isEmptySchema,
  SchemaStore,
  GenericError,
} from "@zerve/zed";
import { useState } from "react";
import { View } from "react-native";
import { Button } from "./Button";
import { JSONSchemaEditor } from "./JSONSchemaEditor";
import { useModal } from "./Modal";
import { Spinner } from "./Spinner";
import { HStack, VStack } from "./Stack";
import { Title } from "./Text";
import { ThemedText } from "./Themed";
import { useAsyncHandler } from "./useAsyncHandler";

export function Dialog<Schema extends JSONSchema>({
  title,
  closeLabel,
  confirmLabel,
  message,
  formSchema,
  formSchemaStore,
  onConfirm,
  danger,
  onClose,
}: {
  title: string;
  onClose: () => void;
  closeLabel?: string;
  confirmLabel?: string;
  formSchema?: Schema;
  formSchemaStore?: SchemaStore;
  message?: string;
  danger?: boolean;
  onConfirm: (value: FromSchema<Schema>) => Promise<void>;
}) {
  const { handle, isLoading, error } = useAsyncHandler<
    FromSchema<Schema>,
    GenericError
  >(onConfirm);
  const [state, setState] = useState<FromSchema<Schema>>(
    getDefaultSchemaValue(formSchema || false, formSchemaStore),
  );
  return (
    <VStack padded>
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 10,
          }}
        >
          <Spinner />
        </View>
      )}
      <Title title={title} danger={danger} />
      {error && <ThemedText danger>{error?.message}</ThemedText>}
      {message && <ThemedText danger={danger}>{message}</ThemedText>}
      {isEmptySchema(formSchema) ? null : (
        <JSONSchemaEditor
          id="dialog"
          schema={formSchema}
          value={state}
          onValue={setState}
          schemaStore={EmptySchemaStore}
        />
      )}
      <HStack>
        <Button onPress={onClose} title={closeLabel || "Close"} />
        <Button
          onPress={() => handle(state)}
          danger={danger}
          primary={!danger}
          title={confirmLabel || "Confirm"}
        />
      </HStack>
    </VStack>
  );
}
