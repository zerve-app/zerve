import React from "react";
import {
  AsyncButton,
  Button,
  Form,
  Paragraph,
  Spinner,
  VStack,
} from "@zerve/zen";
import { useEffect, useRef, useState } from "react";
import { JSONSchemaEditor } from "./JSONSchemaEditor";
import {
  EmptySchemaStore,
  getDefaultSchemaValue,
  SchemaStore,
} from "@zerve/core";

function useAsyncHandler<V, E>(
  handler: (v: V) => Promise<void>
): { error: null | E; isLoading: boolean; handle: (value: V) => void } {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  function handle(value: V) {
    setIsLoading(true);
    setError(null);
    handler(value)
      .then(() => {})
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  return { error, isLoading, handle };
}
export function JSONSchemaForm({
  id,
  value,
  schema,
  saveLabel,
  onValue,
  onCancel,
  onSubmit,
  schemaStore,
}: {
  id: string;
  value: any;
  schema: any;
  saveLabel?: string;
  onCancel?: () => void;
  onValue?: (value: any) => Promise<void>;
  onSubmit?: (value: any) => Promise<void>;
  schemaStore?: SchemaStore;
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
        <VStack>
          {isLoading && <Spinner />}
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
          {(valueState !== value || !!onCancel) && (
            <Button
              onPress={() => {
                setValueState(value);
                onCancel?.();
              }}
              small
              title="Cancel"
              chromeless
            />
          )}
        </VStack>
      </Form>
    </>
  );
}
