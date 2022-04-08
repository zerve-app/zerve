import React from "react";
import { AsyncButton, Button } from "@zerve/ui";
import { useEffect, useRef, useState } from "react";
import { JSONSchemaForm } from "./JSONSchemaForm";
import { SchemaStore } from "@zerve/core";

const EmptySchemaStore: SchemaStore = {} as const;

export function JSONSchemaEditor({
  value,
  schema,
  saveLabel,
  onValue,
  schemaStore,
}: {
  value: any;
  schema: any;
  saveLabel?: string;
  onValue: (value: any) => Promise<void>;
  schemaStore?: SchemaStore;
}) {
  const [valueState, setValueState] = useState(value);
  const seenValueState = useRef(value);
  useEffect(() => {
    if (seenValueState.current !== value) {
      setValueState(value);
      seenValueState.current = value;
    }
  }, [value]);
  return (
    <>
      <JSONSchemaForm
        value={valueState}
        onValue={setValueState}
        schema={schema}
        schemaStore={schemaStore || EmptySchemaStore}
      />
      {valueState !== value && (
        <>
          <AsyncButton
            title={saveLabel || "Save"}
            primary
            onPress={async () => {
              await onValue(valueState);
            }}
          />
          <Button
            onPress={() => {
              setValueState(value);
            }}
            title="Cancel"
          />
        </>
      )}
    </>
  );
}
