import React from "react";
import {
  AsyncButton,
  Button,
  Form,
  Paragraph,
  Spinner,
  useAsyncHandler,
  VStack,
} from "@zerve/zen";
import { useEffect, useRef, useState } from "react";
import { JSONSchemaEditor } from "./JSONSchemaEditor";
import {
  EmptySchemaStore,
  getDefaultSchemaValue,
  SchemaStore,
} from "@zerve/core";

export function JSONSchemaForm({
  id,
  value,
  schema,
  saveLabel,
  onValue,
  onCancel,
  onSubmit,
  schemaStore,
  padded,
}: {
  id: string;
  value?: any;
  schema: any;
  saveLabel?: string;
  onCancel?: () => void;
  onValue?: (value: any) => Promise<void>;
  onSubmit?: (value: any) => void | Promise<void>;
  schemaStore?: SchemaStore;
  padded?: boolean;
}) {
  const [valueState, setValueState] = useState(
    value === undefined ? getDefaultSchemaValue(schema) : value
  );
  const { error, isLoading, handle } = useAsyncHandler(async (value) => {
    await onValue?.(value);
    await onSubmit?.(value);
  });
  const seenValueState = useRef(value);
  useEffect(() => {
    if (seenValueState.current !== value) {
      setValueState(value);
      seenValueState.current = value;
    }
  }, [value]);
  return (
    <>
      <Form
        onSubmit={async () => {
          await onValue?.(valueState);
          await onSubmit?.(valueState);
        }}
      >
        <VStack padded={padded}>
          {error && <Paragraph danger>{error.message}</Paragraph>}
          <JSONSchemaEditor
            id={id}
            value={valueState}
            onValue={setValueState}
            schema={schema}
            onSubmitEditing={async () => {
              await onValue?.(valueState);
              await onSubmit?.(valueState);
            }}
            schemaStore={schemaStore || EmptySchemaStore}
          />
          {(valueState !== value || onSubmit) && (
            <Button
              title={saveLabel || "Save"}
              primary
              onPress={() => {
                handle(valueState);
              }}
            />
          )}
          {!!onCancel && (
            <Button
              onPress={() => {
                setValueState(value);
                onCancel?.();
              }}
              small
              title="Cancel"
              chromeless
              disabled={isLoading}
            />
          )}
          {isLoading && <Spinner />}
        </VStack>
      </Form>
    </>
  );
}
