import React, { ReactNode, useContext, useMemo } from "react";
import {
  CapitalizeSchema,
  expandSchema,
  exploreUnionSchema,
  getDefaultSchemaValue,
  isLeafType,
  JSONSchema,
  JSONSchemaPluck,
  LeafSchema,
  SchemaStore,
} from "@zerve/zed";
import { Pressable, TextStyle, View } from "react-native";
import { setStringAsync } from "expo-clipboard";
import { useTextInputFormModal } from "@zerve/zen/TextInputFormModal";
import {
  JSONSchemaEditorContext,
  useValueImporter,
} from "./JSONSchemaEditorUtilities";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Label } from "./Label";
import { useColors } from "./useColors";
import { VStack } from "./Stack";
import { Paragraph } from "./Text";
import { ThemedText } from "./Themed";
import { ActionButtonDef } from "./ActionButton";
import { InfoRow } from "./Row";
import { Dropdown } from "./Dropdown";
import { useActionsSheet } from "./ActionButtonSheet";
import { Input, SwitchInput } from "./Input";
import { Notice } from "./Notice";

function AddButton({
  onPress,
  label = "Add",
}: {
  onPress: () => void;
  label?: string;
}) {
  return (
    <Button
      title={label}
      style={{ alignSelf: "flex-start" }}
      left={(p) => <Icon {...p} name="plus" />}
      onPress={onPress}
      small
    />
  );
}

function LabelButton({
  title,
  onPress,
  style,
}: {
  title: string;
  onPress?: () => void;
  style?: TextStyle;
}) {
  return (
    <Pressable onPress={onPress}>
      <Label style={style} tint>
        {title}
      </Label>
    </Pressable>
  );
}

export function ObjectEditor({
  value,
  onValue,
  id,
  schema,
  schemaStore,
  onSubmitEditing,
}: {
  value: any;
  onValue?: (v: any) => void;
  id: string;
  schema: JSONSchema;
  schemaStore: SchemaStore;
  onSubmitEditing?: () => void;
}) {
  if (typeof schema !== "object") {
    throw new Error(
      "ObjectEditor can not handle schema of type: " + typeof schema,
    );
  }
  if (schema?.type && schema?.type !== "object") {
    throw new Error("ObjectEditor can not handle type: " + schema?.type);
  }
  const { properties, additionalProperties, propertyTitles, required } = schema;
  const errors: { message: string }[] = [];
  let valueKeys: string[] = [];
  if (value == undefined) {
    errors.push({
      message: "Value is empty but should be an object.",
    });
  } else if (typeof value !== "object") {
    errors.push({ message: "Value is not an object " + JSON.stringify(value) });
  } else {
    valueKeys = Object.keys(value);
  }
  const propertyKeys = new Set(
    properties == null ? [] : Object.keys(properties),
  );
  const otherKeys = value ? valueKeys.filter((p) => !propertyKeys.has(p)) : [];

  const importValue = useValueImporter(schemaStore);

  const propertyNameInput = useTextInputFormModal<null | string>(
    (propertyEditKey) => ({
      onValue: (propertyName) => {
        if (!onValue) return;
        if (value?.[propertyName] !== undefined)
          throw new Error(`Key ${propertyName} already exists here.`);
        const propertySchema =
          schema.properties?.[propertyName] || schema.additionalProperties;
        if (!propertySchema)
          throw new Error(
            "Can not identify the schema of the property you are adding.",
          );
        if (propertyEditKey === null) {
          const defaultValue = getDefaultSchemaValue(
            propertySchema,
            schemaStore,
          );
          const importedValue = importValue(defaultValue, propertySchema);
          onValue({
            ...(value || {}),
            [propertyName]: importedValue,
          });
        } else {
          onValue(
            Object.fromEntries(
              Object.entries(value || {}).map(
                ([propKey, propValue]: [string, any]) => {
                  if (propKey === propertyEditKey)
                    return [propertyName, propValue];
                  return [propKey, propValue];
                },
              ),
            ),
          );
        }
      },
      defaultValue: propertyEditKey || "",
      inputLabel: "New Property Name",
    }),
  );
  const { tint } = useColors();
  return (
    <VStack>
      {schema.description ? <Paragraph>{schema.description}</Paragraph> : null}
      {!!errors.length && (
        <Paragraph>Errors: {errors.map((e) => e.message).join(". ")}</Paragraph>
      )}
      {valueKeys.length === 0 && <ThemedText>Object is Empty.</ThemedText>}
      {valueKeys.length === 0 && additionalProperties === false ? (
        <ThemedText>Schema disallows additional keys.</ThemedText>
      ) : null}
      {[...propertyKeys].map((propertyName, propertyIndex, allKeys) => {
        const fieldLabel = propertyTitles?.[propertyName] || propertyName;
        if (value?.[propertyName] === undefined) {
          if (onValue)
            return (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <LabelButton
                  title={`Add ${fieldLabel}`}
                  onPress={() => {
                    const propertySchema = schema.properties?.[propertyName];
                    if (!propertySchema)
                      throw new Error(
                        `Can not find valid schema for "${propertyName}" property`,
                      );
                    const defaultValue = getDefaultSchemaValue(
                      propertySchema,
                      schemaStore,
                    );
                    const importedValue = importValue(
                      defaultValue,
                      propertySchema,
                    );
                    onValue({
                      ...(value || {}),
                      [propertyName]: importedValue,
                    });
                  }}
                  style={{ marginRight: 8, textAlign: "left" }}
                />
                <Icon name="chevron-right" color={tint} size={12} />
              </View>
            );
          return <Label secondary>{propertyName}</Label>;
        }
        const actions = [];
        if (onValue && (!required || required.indexOf(propertyName) === -1)) {
          actions.push({
            key: "Delete",
            title: `Delete ${propertyTitles?.[propertyName] || propertyName}`,
            icon: "trash",
            onPress: () => {
              const newValue = { ...value };
              delete newValue[propertyName];
              onValue(newValue);
            },
          });
        }
        const isLastKey = propertyIndex === allKeys.length - 1;
        return (
          <FormField
            id={`${id}-${propertyName}`}
            key={propertyName}
            value={value?.[propertyName]}
            valueKey={propertyName}
            schema={schema.properties?.[propertyName]}
            schemaStore={schemaStore}
            label={fieldLabel}
            onSubmitEditing={
              isLastKey
                ? onSubmitEditing
                : () => {
                    // todo, focus the next key when the non-last key is selected
                  }
            }
            actions={actions}
            onValue={
              onValue
                ? (propertyValue) => {
                    const newValue = Object.fromEntries(
                      Object.entries(value).map(([pKey, pValue]) => {
                        if (pKey === propertyName) {
                          return [pKey, propertyValue];
                        }
                        return [pKey, pValue];
                      }),
                    );
                    onValue(newValue);
                  }
                : undefined
            }
          />
        );
      })}
      {otherKeys.map((itemName) => (
        <FormField
          id={`${id}-${itemName}`}
          key={itemName}
          value={value?.[itemName]}
          valueKey={itemName}
          schema={schema.additionalProperties}
          schemaStore={schemaStore}
          label={itemName}
          actions={[
            {
              key: "Delete",
              title: "Delete",
              icon: "trash",
              onPress: () => {
                const newValue = { ...value };
                delete newValue[itemName];
                onValue(newValue);
              },
            },
            {
              key: "Rename",
              title: "Rename",
              icon: "edit",
              onPress: () => {
                propertyNameInput(itemName);
              },
            },
          ]}
          onValue={
            onValue
              ? (propertyValue) => {
                  const newValue = Object.fromEntries(
                    Object.entries(value).map(([pKey, pValue]) => {
                      if (pKey === itemName) {
                        return [pKey, propertyValue];
                      }
                      return [pKey, pValue];
                    }),
                  );
                  onValue(newValue);
                }
              : undefined
          }
        />
      ))}
      {additionalProperties !== false && !!onValue && (
        <AddButton
          label="Add Property"
          onPress={() => {
            propertyNameInput(null);
          }}
        />
      )}
    </VStack>
  );
}

const defaultArrayItemsSchema = {} as const;
const defaultObjectItemsSchema = {} as const;

export function ArrayEditor({
  value,
  onValue,
  schema,
  id,
  schemaStore,
  onSubmitEditing,
}: {
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  id: string;
  schemaStore: SchemaStore;
  onSubmitEditing?: () => void;
}) {
  const importValue = useValueImporter(schemaStore);
  const addButton = onValue ? (
    <AddButton
      label="Add Item"
      onPress={() => {
        if (!schema.items)
          throw new Error("Cannot determine schema for list item");
        onValue([
          ...(value || []),
          importValue(
            getDefaultSchemaValue(schema.items, schemaStore),
            schema.items,
          ),
        ]);
      }}
    />
  ) : null;
  if (!Array.isArray(value))
    return (
      <>
        <ThemedText>Value is not an array</ThemedText>
        {addButton}
      </>
    );
  return (
    <VStack>
      {value.length === 0 && <ThemedText>List is empty.</ThemedText>}
      {value.map((childValue, childValueIndex) => {
        const actions: ActionButtonDef[] = [];
        if (onValue) {
          actions.push({
            key: "Delete",
            title: "Delete",
            icon: "trash",
            onPress: () => {
              const newValue = [...value];
              newValue.splice(childValueIndex, 1);
              onValue(newValue);
            },
          });
        }
        return (
          <FormField
            id={`${id}_${childValueIndex}`}
            label={`#${childValueIndex}`}
            value={childValue}
            valueKey={String(childValueIndex)}
            schema={schema.items}
            schemaStore={schemaStore}
            actions={actions}
            onValue={
              onValue
                ? (childV) => {
                    const newValue = [...value];
                    newValue[childValueIndex] = childV;
                    onValue(newValue);
                  }
                : undefined
            }
          />
        );
      })}
      {!!onValue && addButton}
    </VStack>
  );
}

function getHumanLabelOfSchema(schema: JSONSchema) {
  if (schema === false) return "Never";
  if (schema === true) return "Any";
  if (schema.title) return schema.title;
  if (schema.type === "null") return "Empty";
  if (schema.type === "array") return "List";
  if (schema.type === "object") return "Object";
  if (schema.type === "number") return "Number";
  if (schema.type === "string") return "Text";
  if (schema.const !== undefined) return ""; // constant does not need a human label
  return "?";
}

function ObjectField({
  label,
  labelActions,
  value,
  valueKey,
  onValue,
  schema,
  actions,
  id,
}: {
  label: string;
  labelActions?: ActionButtonDef[];
  value: any;
  valueKey: string;
  onValue?: (v: any) => void;
  id: string;
  schema: JSONSchema;
  actions?: ActionButtonDef[];
}) {
  const { openChildEditor } = useContext(JSONSchemaEditorContext);
  const typeLabel = getHumanLabelOfSchema(schema);
  return (
    <>
      <FieldHeader
        id={id}
        label={label || "?"}
        labelActions={labelActions}
        typeLabel={typeLabel}
        value={value}
        actions={actions}
      />
      <Button
        title={(JSON.stringify(value) || "").slice(0, 60)}
        disabled={!openChildEditor}
        onPress={
          openChildEditor
            ? () => {
                openChildEditor(valueKey);
              }
            : null
        }
      />
    </>
  );
}
function ArrayField({
  id,
  label,
  labelActions,
  value,
  onValue,
  schema,
  valueKey,
  actions,
}: {
  id: string;
  label: string;
  labelActions?: ActionButtonDef[];
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  valueKey: string;
  actions?: ActionButtonDef[];
}) {
  const { openChildEditor } = useContext(JSONSchemaEditorContext);

  return (
    <>
      <FieldHeader
        id={id}
        label={label || "?"}
        labelActions={labelActions}
        typeLabel={getHumanLabelOfSchema(schema)}
        value={value}
        actions={actions}
      />
      <Button
        title={(JSON.stringify(value) || "").slice(0, 60)}
        disabled={!openChildEditor}
        onPress={
          openChildEditor
            ? () => {
                openChildEditor(valueKey);
              }
            : null
        }
      />
    </>
  );
}

function EnumField({
  id,
  label,
  value,
  onValue,
  schema,
  actions,
}: {
  id: string;
  label: string | ReactNode;
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  actions?: ActionButtonDef[];
}) {
  if (!onValue) {
    return <InfoRow label={label} value={value} />;
  }
  return (
    <>
      <FieldHeader
        id={id}
        label={label || "?"}
        typeLabel={schema.title || "Select"}
        value={value}
        actions={actions}
      />
      <Dropdown
        id={id}
        value={value}
        unselectedLabel={`Choose: ${schema.enum.slice(0, 5).join(",")}`}
        onOptionSelect={onValue}
        options={schema.enum.map((optionValue) => ({
          title: String(optionValue),
          value: optionValue,
        }))}
      />
      {schema.description && <Paragraph>{schema.description}</Paragraph>}
    </>
  );
}

function FieldHeader({
  id,
  label,
  labelActions,
  typeLabel,
  value,
  schema,
  actions,
}: {
  id: string;
  label: string;
  labelActions?: ActionButtonDef[];
  typeLabel?: string;
  value?: any;
  schema?: any;
  actions?: ActionButtonDef[];
}) {
  const { tint } = useColors();
  const { enableValueCopy } = useContext(JSONSchemaEditorContext);
  const [labelView] = useActionsSheet(
    (onOpen) => (
      <View
        style={{ flexDirection: "row", alignItems: "center", marginRight: 30 }}
      >
        <Label
          forId={id}
          tint={!!labelActions && !!labelActions.length}
          style={{ marginRight: 8, textAlign: "left" }}
        >
          {label}
        </Label>
        {!!labelActions && !!labelActions.length ? (
          <Icon name="chevron-down" color={tint} size={12} />
        ) : null}
      </View>
    ),
    () => labelActions || [],
    !labelActions || labelActions.length == 0,
  );
  const fieldActions = useMemo(() => {
    const fieldActions = actions ? [...actions] : [];
    if (enableValueCopy && value !== null && typeof value !== "boolean") {
      fieldActions.push({
        key: "clipboard",
        title: label ? `Copy ${label} Value` : "Copy Value",
        icon: "clipboard",
        onPress: async () => {
          await setStringAsync(
            typeof value === "string" ? value : JSON.stringify(value),
          );
        },
      });
    }
    return fieldActions;
  }, [
    actions,
    label,
    enableValueCopy,
    value !== null,
    typeof value !== "boolean",
  ]);
  const [typeLabelView] = useActionsSheet(
    (onOpen) => (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {fieldActions.length ? (
          <Icon name="chevron-down" color={tint} size={12} />
        ) : null}
        {typeLabel ? (
          <Label tint style={{ marginLeft: 8, textAlign: "right" }}>
            {typeLabel}
          </Label>
        ) : null}
      </View>
    ),
    () => fieldActions,
    fieldActions.length === 0,
  );

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingBottom: 6,
        }}
      >
        {labelView}
        <View style={{ flex: 1 }} />
        {typeLabelView}
      </View>
    </View>
  );
}

export function OneOfField({
  id,
  label,
  labelActions,
  value,
  valueKey,
  onValue,
  schema,
  actions,
  onSubmitEditing,
  schemaStore,
}: {
  id: string;
  label: string;
  labelActions?: ActionButtonDef[];
  value: any;
  valueKey: string;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  actions?: ActionButtonDef[];
  onSubmitEditing?: () => void;
  schemaStore: SchemaStore;
}) {
  if (typeof schema !== "object") {
    throw new Error("OneOfField requires an object schema with .oneOf");
  }
  const { oneOf } = schema;
  if (!Array.isArray(oneOf)) {
    throw new Error("OneOfField schema requires .oneOf array");
  }
  const unionOptions = useMemo(
    () => exploreUnionSchema(schema, schemaStore),
    [schema, schemaStore],
  );

  const matched = unionOptions.match(value);
  const matchedSchema = matched == null ? null : oneOf[Number(matched)];

  const fieldLabelActions = useMemo<ActionButtonDef[]>(() => {
    if (!onValue) return [];
    return [
      ...(labelActions || []),
      ...unionOptions.options.map((option, oneOfIndex) => ({
        key: String(oneOfIndex),
        onPress: () => {
          const converter = unionOptions.converters[Number(oneOfIndex)];
          const convertedValue = converter(value);
          onValue(convertedValue);
        },
        title: option.title,
      })),
    ];
  }, [onValue, unionOptions, labelActions]);

  return (
    <>
      {matchedSchema == null ? (
        <>
          <FieldHeader
            id={id}
            value={value}
            label={label || "?"}
            labelActions={fieldLabelActions}
            actions={actions}
          />

          {onValue && (
            <Dropdown
              id={id}
              options={unionOptions.options}
              unselectedLabel={`[Type Not Selected]`}
              value={matched}
              onOptionSelect={(optionValue) => {
                const converter = unionOptions.converters[Number(optionValue)];
                const convertedValue = converter(value);
                onValue(convertedValue);
              }}
            />
          )}
        </>
      ) : (
        <FormField
          id={id}
          value={value}
          valueKey={valueKey}
          onValue={onValue}
          schema={matchedSchema}
          label={label}
          actions={actions}
          labelActions={fieldLabelActions}
          onSubmitEditing={onSubmitEditing}
          schemaStore={schemaStore}
          typeLabel={
            matched == null ? "?" : unionOptions.options[matched].title
          }
        />
      )}
    </>
  );
}

export function FormField({
  label,
  labelActions,
  value,
  onValue,
  id,
  schema,
  schemaStore,
  typeLabel,
  actions,
  onSubmitEditing,
  valueKey,
}: {
  label: string;
  labelActions?: ActionButtonDef[];
  value: any;
  onValue?: (v: any) => void;
  id: string;
  schema: JSONSchema;
  schemaStore: SchemaStore;
  typeLabel?: string;
  actions?: ActionButtonDef[];
  onSubmitEditing?: () => void;
  valueKey: string;
}) {
  const { OverrideFieldComponents } = useContext(JSONSchemaEditorContext);
  const OverrideComponent =
    OverrideFieldComponents?.[schema.$id] ||
    OverrideFieldComponents?.[schema.$ref];
  if (OverrideComponent) {
    return (
      <>
        <FieldHeader
          id={id}
          label={label}
          labelActions={labelActions}
          typeLabel={getHumanLabelOfSchema(schema)}
          value={value}
          actions={actions}
        />
        <OverrideComponent
          id={id}
          value={value}
          onValue={onValue}
          schema={schema}
          onSubmitEditing={onSubmitEditing}
        />
      </>
    );
  }
  if (!schema) {
    if (valueKey[0] === "$") return null;
    const deleteAction = actions?.find((a) => a.key === "Delete");
    return (
      <Notice
        danger
        message={`Could not find schema for "${label}" property with value: ${JSON.stringify(
          value,
        )}`}
      >
        {deleteAction && (
          <Button
            small
            title={`Delete ${label}`}
            onPress={deleteAction.onPress}
          />
        )}
      </Notice>
    );
  }
  if (isLeafType(schema.type) || schema.const != null) {
    return (
      <LeafField
        id={id}
        value={value}
        schema={schema}
        label={label}
        labelActions={labelActions}
        onValue={onValue}
        typeLabel={typeLabel}
        actions={actions}
        onSubmitEditing={onSubmitEditing}
      />
    );
  }

  if (schema.oneOf) {
    return (
      <OneOfField
        id={id}
        value={value}
        valueKey={valueKey}
        schema={schema}
        schemaStore={schemaStore}
        label={label}
        labelActions={labelActions}
        onValue={onValue}
        actions={actions}
        onSubmitEditing={onSubmitEditing}
      />
    );
  }
  if (schema.enum) {
    return (
      <EnumField
        id={id}
        value={value}
        schema={schema}
        label={label}
        labelActions={labelActions}
        onValue={onValue}
        actions={actions}
      />
    );
  }
  if (schema.type === "object") {
    return (
      <ObjectField
        id={id}
        value={value}
        schema={schema}
        label={label}
        labelActions={labelActions}
        onValue={onValue}
        actions={actions}
        valueKey={valueKey}
      />
    );
  }

  if (schema.type === "array") {
    return (
      <ArrayField
        id={id}
        value={value}
        valueKey={valueKey}
        schema={schema}
        label={label}
        onValue={onValue}
        actions={actions}
      />
    );
  }

  return (
    <ThemedText>
      {label}:: Unhandled Child Schema: {JSON.stringify(schema)}
    </ThemedText>
  );
}

export function LeafField({
  label,
  labelActions,
  value,
  onValue,
  schema,
  schemaStore,
  actions,
  onSubmitEditing,
  id,
}: {
  label: string | ReactNode;
  labelActions?: ActionButtonDef[];
  value: any;
  id: string;
  onValue?: (v: any) => void;
  schema: LeafSchema;
  schemaStore: SchemaStore;
  actions?: ActionButtonDef[];
  onSubmitEditing?: () => void;
}) {
  const description = schema.description ? (
    <Paragraph>{schema.description}</Paragraph>
  ) : null;
  if (schema.const != null) {
    if (value === schema.const) {
      return (
        <>
          <FieldHeader
            id={id}
            label={`${label || ""}: ${schema.title || schema.const}`}
            labelActions={labelActions}
            typeLabel={getHumanLabelOfSchema(schema)}
            value={value}
            actions={actions}
          />
          {description}
        </>
      );
    }
    return (
      <>
        <FieldHeader
          id={id}
          label={`${label || ""}: ${JSON.stringify(value)} `}
          labelActions={labelActions}
          typeLabel={getHumanLabelOfSchema(schema)}
          value={value}
          actions={actions}
        />
        {description}
      </>
    );
  }
  if (schema.type === "string") {
    const autoCapitalize = JSONSchemaPluck(
      CapitalizeSchema,
      schema.capitalize,
      schemaStore,
    );
    return (
      <>
        <FieldHeader
          id={id}
          label={label}
          labelActions={labelActions}
          typeLabel={getHumanLabelOfSchema(schema)}
          value={value}
          actions={actions}
        />
        <Input
          id={id}
          disabled={!onValue}
          value={value}
          onValue={onValue}
          placeholder={schema.placeholder}
          autoCapitalize={autoCapitalize}
          returnKeyType="done"
          keyboardType={schema.inputType}
          onSubmitEditing={onSubmitEditing}
        />
        {description}
      </>
    );
  }

  if (schema.type === "number" || schema.type === "integer") {
    const defaultNumber = schema.default || 0;
    return (
      <>
        <FieldHeader
          id={id}
          label={label}
          labelActions={labelActions}
          typeLabel={getHumanLabelOfSchema(schema)}
          value={value}
          actions={actions}
        />
        <Input
          disabled={!onValue}
          placeholder={String(defaultNumber)}
          keyboardType={schema.type === "integer" ? "number-pad" : "numeric"}
          value={value == null ? "" : String(value)}
          onSubmitEditing={onSubmitEditing}
          onValue={
            onValue ? (valueString) => onValue(Number(valueString)) : undefined
          }
        />
        {description}
      </>
    );
  }
  if (schema.type === "boolean") {
    return (
      <>
        <FieldHeader
          id={id}
          label={label}
          labelActions={labelActions}
          typeLabel={getHumanLabelOfSchema(schema)}
          value={value}
          actions={actions}
        />
        <SwitchInput disabled={!onValue} value={value} onValue={onValue} />
        {description}
      </>
    );
  }
  if (schema.type === "null") {
    return (
      <>
        <FieldHeader
          id={id}
          label={label}
          labelActions={labelActions}
          typeLabel={getHumanLabelOfSchema(schema)}
          value={value}
          actions={actions}
        />
        {description}
      </>
    );
  }

  return <ThemedText danger>Invalid field schema</ThemedText>;
}

export function JSONSchemaEditor({
  value,
  onValue,
  schema,
  label,
  schemaStore,
  id,
  onSubmitEditing,
}: {
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  label?: string | ReactNode;
  schemaStore: SchemaStore;
  onSubmitEditing?: () => void;
  id: string;
}) {
  const expandedSchema = useMemo(
    () => expandSchema(schema, schemaStore),
    [schema, schemaStore],
  );
  const { OverrideFieldComponents } = useContext(JSONSchemaEditorContext);
  const OverrideComponent =
    OverrideFieldComponents?.[expandedSchema?.$id] ||
    OverrideFieldComponents?.[expandedSchema?.$ref];
  if (OverrideComponent) {
    return (
      <>
        <OverrideComponent
          id={id}
          value={value}
          onValue={onValue}
          schema={schema}
          onSubmitEditing={onSubmitEditing}
        />
      </>
    );
  }
  if (!expandedSchema) {
    return <ThemedText>Value not allowed.</ThemedText>;
  }
  if (typeof expandedSchema !== "object")
    throw new Error("Schema was not properly expanded");

  if (expandedSchema.oneOf) {
    const unionOptions = exploreUnionSchema(expandedSchema);
    const matched = unionOptions.match(value);
    const matchedSchema = expandedSchema.oneOf[Number(matched)];
    return (
      <>
        {onValue && (
          <Dropdown
            id={`${id}-oneof-select`}
            options={unionOptions.options}
            value={matched}
            unselectedLabel={`Select Type...`}
            onOptionSelect={(optionValue) => {
              const converter = unionOptions.converters[Number(optionValue)];
              const convertedValue = converter(value);
              onValue(convertedValue);
            }}
          />
        )}
        {matchedSchema != null && (
          <JSONSchemaEditor
            id={`${id}`}
            value={value}
            onValue={onValue}
            schema={matchedSchema}
            schemaStore={schemaStore}
            label={label}
          />
        )}
      </>
    );
  }
  if (expandedSchema.anyOf) {
    return <ThemedText>anyOf schema unsupported</ThemedText>;
  }
  if (expandedSchema.type === "array") {
    return (
      <ArrayEditor
        id={id}
        value={value}
        onValue={onValue}
        schema={expandedSchema}
        schemaStore={schemaStore}
        onSubmitEditing={onSubmitEditing}
      />
    );
  }
  if (expandedSchema.type === "object") {
    return (
      <ObjectEditor
        id={id}
        value={value}
        onValue={onValue}
        schema={expandedSchema}
        schemaStore={schemaStore}
        onSubmitEditing={onSubmitEditing}
      />
    );
  }
  if (isLeafType(expandedSchema.type) || expandedSchema.const !== undefined) {
    return (
      <LeafField
        id={id}
        label={label || ""}
        value={value}
        onValue={onValue}
        schema={expandedSchema}
        schemaStore={schemaStore}
        onSubmitEditing={onSubmitEditing}
      />
    );
  }
  if (expandedSchema.enum) {
    return (
      <EnumField
        id={id}
        label={expandedSchema?.title || expandedSchema.type || "enum"}
        value={value}
        onValue={onValue}
        schema={schema}
      />
    );
  }

  return <ThemedText>Failed to create form for this schema</ThemedText>;
}
