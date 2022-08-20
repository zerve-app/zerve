import React, { useCallback, useContext, useMemo } from "react";
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
import { JSONSchemaEditor, JSONSchemaEditorContext } from "./JSONSchemaEditor";
import {
  EmptySchemaStore,
  getDefaultSchemaValue,
  JSONSchema,
  SchemaStore,
} from "@zerve/core";
import { getValueExport, getValueImport } from "./JSONSchemaEditorUtilities";

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
  const { OverrideFieldComponents } = useContext(JSONSchemaEditorContext);
  const [importValue, exportValue] = useMemo(() => {
    return [
      getValueImport(OverrideFieldComponents),
      getValueExport(OverrideFieldComponents),
    ];
  }, [OverrideFieldComponents]);
  const initValue = useMemo(() => {
    return importValue(
      value === undefined ? getDefaultSchemaValue(schema) : value,
      schema,
    );
  }, [value, schema, importValue]);

  const [valueState, setValueState] = useState(initValue);
  const [savedValue, setSavedValue] = useState(initValue);

  const { error, isLoading, handle } = useAsyncHandler(async (value) => {
    const outputValue = exportValue(value, schema);
    await onValue?.(outputValue);
    await onSubmit?.(outputValue);
    setSavedValue(value);
  });
  // const seenValueState = useRef(value);
  // useEffect(() => {
  //   if (seenValueState.current !== value) {
  //     setValueState(value);
  //     seenValueState.current = value;
  //   }
  // }, [value]);
  return (
    <>
      <Form
        onSubmit={() => {
          handle(valueState);
        }}
      >
        <VStack padded={padded}>
          {error && <Paragraph danger>{error.message}</Paragraph>}
          <JSONSchemaEditor
            id={id}
            value={valueState}
            onValue={setValueState}
            schema={schema}
            onSubmitEditing={() => {
              handle(valueState);
            }}
            schemaStore={schemaStore || EmptySchemaStore}
          />
          {(valueState !== savedValue || onSubmit) && (
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
