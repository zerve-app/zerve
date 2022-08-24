import React, { ComponentProps, useContext, useMemo } from "react";
import { useState } from "react";
import { JSONSchemaEditor } from "./JSONSchemaEditor";
import {
  EmptySchemaStore,
  getDefaultSchemaValue,
  SchemaStore,
} from "@zerve/core";
import {
  getValueExport,
  getValueImport,
  JSONSchemaEditorContext,
} from "./JSONSchemaEditorUtilities";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import { Form } from "./Form";
import { VStack } from "./Stack";
import { Paragraph } from "./Text";
import { useAsyncHandler } from "./useAsyncHandler";
import { Icon } from "./Icon";

export function JSONSchemaForm({
  id,
  value,
  schema,
  saveLabel,
  saveIcon,
  onValue,
  onDirty,
  onCancel,
  onSubmit,
  schemaStore,
  padded,
}: {
  id: string;
  value?: any;
  schema: any;
  saveLabel?: string;
  saveIcon?: ComponentProps<typeof Icon>["name"];
  onCancel?: () => void;
  onValue?: (value: any) => Promise<void>;
  onDirty?: () => void;
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
            onValue={(value) => {
              setValueState(value);
              onDirty?.();
            }}
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
          {!!onCancel && savedValue !== valueState && (
            <Button
              onPress={() => {
                setValueState(savedValue);
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
