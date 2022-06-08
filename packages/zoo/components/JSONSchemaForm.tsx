import React from "react";
import { AsyncButton, Button, Form } from "@zerve/zen";
import { useEffect, useRef, useState } from "react";
import { JSONSchemaEditor } from "./JSONSchemaEditor";
import {
  EmptySchemaStore,
  getDefaultSchemaValue,
  SchemaStore,
} from "@zerve/core";

export function JSONSchemaForm({
  value,
  schema,
  saveLabel,
  onValue,
  onCancel,
  onSubmit,
  schemaStore,
}: {
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
        <JSONSchemaEditor
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
          <AsyncButton
            title={saveLabel || "Save"}
            primary
            onPress={async () => {
              await onValue?.(valueState);
              await onSubmit?.(valueState);
            }}
          />
        )}
        {(valueState !== value || !!onCancel) && (
          <Button
            onPress={() => {
              setValueState(value);
              onCancel?.();
            }}
            title="Cancel"
          />
        )}
      </Form>
    </>
  );
}
