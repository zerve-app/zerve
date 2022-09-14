import React, {
  ComponentProps,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  CapitalizeSchema,
  expandSchema,
  exploreUnionSchema,
  getDefaultSchemaValue,
  getListItemKey,
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
  OverrideFieldComponents,
  useValueImporter,
} from "./JSONSchemaEditorUtilities";
import { Button, ContentButton } from "./Button";
import { Icon } from "./Icon";
import { Label } from "./Label";
import { useColors } from "./useColors";
import { VStack } from "./Stack";
import { Paragraph } from "./Text";
import { TextProps, ThemedText } from "./Themed";
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
      inline
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

function ButtonFormHeader({
  title,
  hasChanged,
  onPress,
  icon,
}: {
  title: string;
  hasChanged?: boolean;
  onPress: () => void;
  icon: ComponentProps<typeof Icon>["name"];
}) {
  const colors = useColors();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: hasChanged ? colors.changedTint : undefined,
        paddingHorizontal: hasChanged ? 4 : 0,
        paddingVertical: hasChanged ? 6 : 0,
        borderRadius: 4,
      }}
    >
      <LabelButton
        title={title}
        onPress={onPress}
        style={{ marginRight: 8, textAlign: "left" }}
      />
      {icon && <Icon name={icon} color={colors.tint} size={12} />}
    </View>
  );
}

export function ObjectEditor({
  value,
  comparisonValue,
  onValue,
  id,
  schema,
  schemaStore,
  onSubmitEditing,
}: {
  value: any;
  comparisonValue?: any;
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
  const propertyKeyList = properties == null ? [] : Object.keys(properties);

  const propertyKeys = new Set(propertyKeyList);
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
      validate: (propertyName: string) => {
        if (propertyName[0] === "$")
          return "Property name may not start with $";
        return null;
      },
      defaultValue: propertyEditKey || "",
      inputLabel: "New Property Name",
    }),
  );
  // @*@#$ DRAGON ALERT
  // &%$^* vvvvvvv beware. here be dragons
  const refOfRegret = useRef(value);
  refOfRegret.current = value;
  // @#$&* ^^^^^^^
  // *#Y$% there is some binding issue that prevents the correct value from flowing through to the property onValue callback in certain cases
  // )@#Y@ DRAGON ALERT
  return (
    <VStack>
      {schema.description ? <Paragraph>{schema.description}</Paragraph> : null}
      {!!errors.length && (
        <Notice
          danger
          message={`Error${errors.length > 1 ? "s" : ""}: ${errors
            .map((e) => e.message)
            .join(". ")}`}
        />
      )}
      {valueKeys.length === 0 && propertyKeyList.length === 0 && (
        <ThemedText>Object is Empty.</ThemedText>
      )}

      {propertyKeyList.map((propertyName, propertyIndex, allKeys) => {
        if (propertyName[0] === "$") return null;
        const fieldLabel = propertyTitles?.[propertyName] || propertyName;
        if (value?.[propertyName] === undefined) {
          if (onValue) {
            const keyHasChanged = comparisonValue?.[propertyName] !== undefined;
            return (
              <ButtonFormHeader
                title={`Add ${fieldLabel}`}
                icon="chevron-right"
                hasChanged={keyHasChanged}
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
              />
            );
          } else {
            return <Label secondary>{propertyName}</Label>;
          }
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
        const childCompareValue =
          comparisonValue === undefined
            ? undefined
            : comparisonValue?.[propertyName] === undefined
            ? MissingValueSymbol
            : comparisonValue?.[propertyName];
        return (
          <FormField
            id={`${id}-${propertyName}`}
            key={propertyName}
            value={value?.[propertyName]}
            comparisonValue={childCompareValue}
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
                    // !^@#*^!@*#!(@*#!^*@(!))
                    // BE AWARE. HERE BE DRAGONS:
                    // we should be able to use "value" here instead of the refOfRegret. but for some reason, react is not updating this callback.
                    // OR js binding is failing here (the "arrow fn" we are in should always bind to the `value` in this ObjectEditor fn component)
                    const $DRAGON_VALUE = refOfRegret.current;
                    // !^@#*^!@*#!(@*#!^*@(!))
                    const newValue = Object.fromEntries(
                      Object.entries($DRAGON_VALUE).map(([pKey, pValue]) => {
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
      {valueKeys.length === 0 &&
      propertyKeyList.length === 0 &&
      additionalProperties === false ? (
        <ThemedText>Schema disallows additional keys.</ThemedText>
      ) : null}
      {otherKeys.map((itemName) => {
        if (itemName[0] === "$") return null;

        const actions: ActionButtonDef[] = [];
        if (onValue) {
          actions.push({
            key: "Delete",
            title: "Delete",
            icon: "trash",
            onPress: () => {
              const newValue = { ...value };
              delete newValue[itemName];
              onValue(newValue);
            },
          });
          actions.push({
            key: "Rename",
            title: "Rename",
            icon: "edit",
            onPress: () => {
              propertyNameInput(itemName);
            },
          });
        }
        const childCompareValue =
          comparisonValue === undefined
            ? undefined
            : comparisonValue?.[itemName] === undefined
            ? MissingValueSymbol
            : comparisonValue?.[itemName];
        return (
          <FormField
            id={`${id}-${itemName}`}
            key={itemName}
            value={value?.[itemName]}
            comparisonValue={childCompareValue}
            valueKey={itemName}
            schema={
              schema.additionalProperties == null
                ? true
                : schema.additionalProperties
            }
            schemaStore={schemaStore}
            label={itemName}
            actions={actions}
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
        );
      })}
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

export function ArrayEditor({
  value,
  comparisonValue,
  onValue,
  schema,
  id,
  schemaStore,
  onSubmitEditing,
}: {
  value: any;
  comparisonValue?: any;
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
        const key = getListItemKey(childValue, childValueIndex);
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
        const childCompareValue =
          comparisonValue === undefined
            ? undefined
            : comparisonValue?.[childValueIndex] === undefined
            ? MissingValueSymbol
            : comparisonValue?.[childValueIndex];
        return (
          <FormField
            key={key}
            id={`${id}_${key}`}
            label={key}
            value={childValue}
            comparisonValue={childCompareValue}
            valueKey={key}
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
  if (schema.type === "boolean") return "Switch";
  if (schema.const !== undefined) return ""; // constant does not need a human label
  return "?";
}

function ValueLine({ value, schema }: { value: any; schema: any }) {
  const lineProps: TextProps = {
    numberOfLines: 1,
  };
  const { OverrideFieldComponents } = useContext(JSONSchemaEditorContext);
  const OverrideComponent = getOverrideComponent(
    schema,
    OverrideFieldComponents,
  );
  if (OverrideComponent) {
    const overrideAsText = OverrideComponent?.renderAsText;
    if (overrideAsText)
      return <ThemedText {...lineProps}>{overrideAsText(value)}</ThemedText>;
  }
  if (value === null) return <ThemedText secondary>(Empty)</ThemedText>;
  if (value === "") return <ThemedText secondary>(Empty Text)</ThemedText>;
  if (typeof value === "object") {
    if (typeof value.title === "string")
      return <ThemedText {...lineProps}>{value.title}</ThemedText>;
    return <ThemedText {...lineProps}>{JSON.stringify(value)}</ThemedText>;
  }
  if (value === true) return <ThemedText {...lineProps}>True</ThemedText>;
  if (value === false) return <ThemedText {...lineProps}>False</ThemedText>;
  if (value == null) return <ThemedText {...lineProps}>Empty</ThemedText>;
  if (typeof value === "string" || typeof value === "number")
    return <ThemedText {...lineProps}>{value}</ThemedText>;
  return <ThemedText {...lineProps}>{JSON.stringify(value)}</ThemedText>;
}

function limitList<A = any>(list: Array<A>, rowCount: number) {
  if (list.length <= rowCount) return { visible: list, remainder: [] };
  return {
    visible: list.slice(0, rowCount - 1),
    remainder: list.slice(rowCount - 1),
  };
}

function ValueView({ value, schema }: { value: any; schema: any }) {
  // const { openRef } = useContext(JSONSchemaEditorContext);
  const { OverrideFieldComponents } = useContext(JSONSchemaEditorContext);
  if (schema.$id || schema.$ref) {
    const OverrideComponent = getOverrideComponent(
      schema,
      OverrideFieldComponents,
    );
    if (OverrideComponent?.renderAsText) {
      return <ValueLine value={value} schema={schema} />;
    }
  }
  if (Array.isArray(value)) {
    const { visible, remainder } = limitList(value, 5);
    return (
      <View style={{}}>
        {visible.length === 0 ? (
          <ThemedText secondary>Empty List</ThemedText>
        ) : null}
        {visible.map((value, index) => (
          <View style={{ flexDirection: "row", marginVertical: 2 }} key={index}>
            <ValueLine value={value} schema={schema.items} />
          </View>
        ))}
        {remainder.length > 0 ? (
          <View style={{ flexDirection: "row", marginVertical: 2 }}>
            <ThemedText secondary>+ {remainder.length} more</ThemedText>
          </View>
        ) : null}
      </View>
    );
  }
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value);
    const { visible, remainder } = limitList(
      entries.filter((entry) => {
        return entry[0] !== "title" && entry[0][0] !== "$";
      }),
      5,
    );
    return (
      <View style={{}}>
        {value.title ? (
          <ThemedText style={{ fontWeight: "bold" }}>{value.title}</ThemedText>
        ) : null}
        {entries.length === 0 ? (
          <ThemedText secondary>Empty Object</ThemedText>
        ) : visible.length === 0 && !value.title ? (
          <ThemedText secondary>Object</ThemedText>
        ) : null}
        {/* {value.$ref ? (
          <ThemedText style={{ alignSelf: "flex-end" }} tint>
            Open {value.title} Schema
          </ThemedText>
        ) : null} */}
        {visible.map(([propName, propValue]) => {
          return (
            <View
              style={{ flexDirection: "row", marginVertical: 2 }}
              key={propName}
            >
              <ThemedText style={{ fontWeight: "bold" }}>
                {propName}:{" "}
              </ThemedText>
              <ValueLine
                value={propValue}
                schema={
                  schema.properties?.[propName] || schema.additionalProperties
                }
              />
            </View>
          );
        })}
        {remainder.length > 0 ? (
          <View style={{ flexDirection: "row", marginVertical: 2 }}>
            <ThemedText secondary>
              + {remainder.map((entry) => entry[0]).join(", ")}
            </ThemedText>
          </View>
        ) : null}
      </View>
    );
  }
  return <ValueLine value={value} schema={schema} />;
}

function ObjectField({
  label,
  labelActions,
  value,
  comparisonValue,
  valueKey,
  onValue,
  schema,
  actions,
  id,
}: {
  label: string;
  labelActions?: ActionButtonDef[];
  value: any;
  comparisonValue?: any;
  valueKey: string;
  onValue?: (v: any) => void;
  id: string;
  schema: JSONSchema;
  actions?: ActionButtonDef[];
}) {
  const { openChildEditor } = useContext(JSONSchemaEditorContext);
  const typeLabel = getHumanLabelOfSchema(schema);
  const colors = useColors();
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
      <ContentButton
        id={id}
        tint={
          comparisonValue !== undefined && comparisonValue !== value
            ? colors.changedTint
            : null
        }
        disabled={!openChildEditor}
        onPress={
          openChildEditor
            ? () => {
                openChildEditor(valueKey);
              }
            : null
        }
      >
        <ValueView value={value} schema={schema} />
      </ContentButton>
    </>
  );
}
function ArrayField({
  id,
  label,
  labelActions,
  value,
  comparisonValue,
  onValue,
  schema,
  valueKey,
  actions,
}: {
  id: string;
  label: string;
  labelActions?: ActionButtonDef[];
  value: any;
  comparisonValue?: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  valueKey: string;
  actions?: ActionButtonDef[];
}) {
  const { openChildEditor } = useContext(JSONSchemaEditorContext);
  const colors = useColors();
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
      <ContentButton
        id={id}
        disabled={!openChildEditor}
        tint={
          comparisonValue !== undefined && comparisonValue !== value
            ? colors.changedTint
            : null
        }
        onPress={
          openChildEditor
            ? () => {
                openChildEditor(valueKey);
              }
            : null
        }
      >
        <ValueView value={value} schema={schema} />
      </ContentButton>
    </>
  );
}

function EnumField({
  id,
  label,
  value,
  comparisonValue,
  onValue,
  schema,
  actions,
}: {
  id: string;
  label: string | ReactNode;
  value: any;
  comparisonValue?: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  actions?: ActionButtonDef[];
}) {
  if (!onValue) {
    return <InfoRow label={label} value={value} />;
  }
  const colors = useColors();
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
        tint={
          comparisonValue !== undefined && value !== comparisonValue
            ? colors.changedTint
            : null
        }
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
  changedTint,
}: {
  id: string;
  label: string;
  labelActions?: ActionButtonDef[];
  typeLabel?: string;
  value?: any;
  schema?: any;
  actions?: ActionButtonDef[];
  changedTint?: boolean;
}) {
  const { tint, ...colors } = useColors();
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
    <View
      style={{
        borderRadius: 4,
        ...(changedTint
          ? {
              backgroundColor: colors.changedTint,
              paddingTop: 4,
              paddingHorizontal: 4,
            }
          : {}),
      }}
    >
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
  comparisonValue,
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
  comparisonValue?: any;
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
              // tint={}
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
          comparisonValue={comparisonValue}
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
type FormFieldProps = {
  label: string;
  labelActions?: ActionButtonDef[];
  value: any;
  comparisonValue?: any;
  onValue?: (v: any) => void;
  id: string;
  schema: JSONSchema;
  schemaStore: SchemaStore;
  typeLabel?: string;
  actions?: ActionButtonDef[];
  onSubmitEditing?: () => void;
  valueKey: string;
  stopDangerousRecursion?: boolean;
};
export function UnexpandedFormField(fieldProps: FormFieldProps) {
  const { schema, schemaStore } = fieldProps;
  const expandedSchema = useMemo(() => {
    return expandSchema(schema, schemaStore);
  }, [schema, schemaStore]);
  return (
    <FormField {...fieldProps} schema={expandedSchema} stopDangerousRecursion />
  );
}

function getOverrideComponent(
  schema: JSONSchema,
  OverrideFieldComponents: OverrideFieldComponents | undefined,
) {
  const override =
    schema !== true &&
    schema !== false &&
    schema != null &&
    ((schema?.$id && OverrideFieldComponents?.[schema?.$id]) ||
      (schema?.$ref && OverrideFieldComponents?.[schema?.$ref]));
  if (override) return override;
  return null;
}

export function FormField(fieldProps: FormFieldProps) {
  const {
    label,
    labelActions,
    value,
    comparisonValue,
    onValue,
    id,
    schema,
    schemaStore,
    typeLabel,
    actions,
    onSubmitEditing,
    valueKey,
    stopDangerousRecursion,
  } = fieldProps;
  const { OverrideFieldComponents } = useContext(JSONSchemaEditorContext);
  const OverrideComponent = getOverrideComponent(
    schema,
    OverrideFieldComponents,
  );
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
          comparisonValue={comparisonValue}
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
        {!!deleteAction && (
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
        comparisonValue={comparisonValue}
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
        comparisonValue={comparisonValue}
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
        comparisonValue={comparisonValue}
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
        comparisonValue={comparisonValue}
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
        comparisonValue={comparisonValue}
        valueKey={valueKey}
        schema={schema}
        label={label}
        onValue={onValue}
        actions={actions}
      />
    );
  }
  if (stopDangerousRecursion) {
    return <Notice danger message="Failed to present this value" />;
  }

  return <UnexpandedFormField {...fieldProps} />;
}

export function LeafField({
  label,
  labelActions,
  value,
  comparisonValue,
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
  comparisonValue?: any;
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
  const colors = useColors();
  if (schema.const != null) {
    if (value === schema.const) {
      return (
        <>
          <FieldHeader
            id={id}
            label={`${label || ""}: ${schema.title || schema.const}`}
            labelActions={labelActions}
            value={value}
            changedTint={comparisonValue !== value}
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
          tint={
            comparisonValue !== undefined && value !== comparisonValue
              ? colors.changedTint
              : null
          }
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
          tint={
            comparisonValue !== undefined && value !== comparisonValue
              ? colors.changedTint
              : null
          }
          onSubmitEditing={onSubmitEditing}
          onValue={
            onValue
              ? (valueString) => {
                  const newValue = Number(valueString);
                  if (Number.isNaN(newValue)) return;
                  onValue(newValue);
                }
              : undefined
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
        <SwitchInput
          disabled={!onValue}
          value={value}
          onValue={onValue}
          tint={
            comparisonValue !== undefined && value !== comparisonValue
              ? colors.changedTint
              : null
          }
        />
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

const MissingValueSymbol = Symbol("MissingValue");

export function JSONSchemaEditor({
  value,
  comparisonValue,
  onValue,
  schema,
  label,
  schemaStore,
  id,
  onSubmitEditing,
}: {
  value: any;
  comparisonValue?: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  label?: string | ReactNode;
  schemaStore: SchemaStore;
  onSubmitEditing?: () => void;
  id: string;
}) {
  const colors = useColors();
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
          comparisonValue={comparisonValue}
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
    const matchedComparison =
      comparisonValue !== undefined && unionOptions.match(comparisonValue);
    const matchedSchema = expandedSchema.oneOf[Number(matched)];
    return (
      <>
        {onValue && (
          <Dropdown
            id={`${id}-oneof-select`}
            options={unionOptions.options}
            value={matched}
            tint={
              comparisonValue !== undefined && matched !== matchedComparison
                ? colors.changedTint
                : null
            }
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
            comparisonValue={comparisonValue}
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
        comparisonValue={comparisonValue}
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
        comparisonValue={comparisonValue}
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
        comparisonValue={comparisonValue}
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
        comparisonValue={comparisonValue}
        onValue={onValue}
        schema={schema}
      />
    );
  }

  return <ThemedText>Failed to create form for this schema</ThemedText>;
}
