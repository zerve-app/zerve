import React from "react";
import { AsyncButton, Button } from "@zerve/ui";
import { useEffect, useRef, useState } from "react";
import { JSONSchemaForm } from "./JSONSchemaForm";

export function FileEditor({
  value,
  schema,
  saveLabel,
  onValue,
}: {
  value: any;
  schema: any;
  saveLabel?: string;
  onValue: (value: any) => Promise<void>;
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
