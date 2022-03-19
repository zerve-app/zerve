import React, { useCallback, useMemo, useRef, useState } from "react";

import { HomeStackScreenProps } from "../app/Links";
import AppPage from "../components/AppPage";
import {
  AsyncButton,
  Button,
  HStack,
  Input,
  PageTitle,
  Paragraph,
  SwitchInput,
  VStack,
} from "@zerve/ui";
import { useDocEval } from "../app/Doc";
import { deleteDoc } from "@zerve/native";
import { View, Text, StyleSheet } from "react-native";
import { useBottomSheet } from "../app/BottomSheet";
import { useBottomSheetDynamicSnapPoints } from "@gorhom/bottom-sheet";
import { postZAction, QueryConnectionProvider, useZNode } from "@zerve/query";
import { useConnection, useConnections } from "../app/Connection";
import { StackActions, useNavigation } from "@react-navigation/native";
import { JSONSchema } from "@zerve/core";

function ZContainerNode({
  type,
  value,
  connection,
  path,
}: {
  type: any;
  value: any;
  connection: string;
  path: string[];
}) {
  const { dispatch } = useNavigation();
  const childNames = Object.keys(type.children);
  return (
    <VStack>
      {childNames.map((childName) => (
        <Button
          title={childName}
          key={childName}
          onPress={() => {
            dispatch(
              StackActions.push("ZNode", {
                connection,
                path: [...path, childName],
              })
            );
          }}
        />
      ))}
    </VStack>
  );
}

function ZGroupNode({
  type,
  value,
  connection,
  path,
}: {
  type: any;
  value: any;
  connection: string;
  path: string[];
}) {
  const { dispatch } = useNavigation();
  const childNames = value?.children || [];

  return (
    <VStack>
      <Paragraph>{JSON.stringify(value)}</Paragraph>
      {childNames.map((childName: string) => (
        <Button
          title={childName}
          key={childName}
          onPress={() => {
            dispatch(
              StackActions.push("ZNode", {
                connection,
                path: [...path, childName],
              })
            );
          }}
        />
      ))}
    </VStack>
  );
}

// function JSONSchemaForm({value, onValue, schema}: {value: any, onValue: (v: any)=> void, schema: JSONSchema}) {

//   return null;
// }

function JSONSchemaObjectForm({
  value,
  onValue,
  schema,
}: {
  value: any;
  onValue: (v: any) => void;
  schema: JSONSchema;
}) {
  const { properties, additionalProperties } = schema;
  return (
    <>
      {Object.entries(properties).map(([propertyName, propertySchema]) => (
        <JSONSchemaFieldForm
          value={value?.[propertyName]}
          schema={propertySchema}
          label={propertyName}
          onValue={(propertyValue) =>
            onValue({ ...value, [propertyName]: propertyValue })
          }
        />
      ))}
      {additionalProperties !== false && !!onValue && (
        <Button onPress={() => {}} title="Add" />
      )}
    </>
  );
}

function JSONSchemaFieldForm({
  label,
  value,
  onValue,
  schema,
}: {
  label: string;
  value: any;
  onValue: (v: any) => void;
  schema: JSONSchema;
}) {
  if (schema.type === "string") {
    return (
      <Input value={value} onValue={onValue} label={schema.title || label} />
    );
  }
  if (schema.type === "number") {
    return (
      <Input value={value} onValue={onValue} label={schema.title || label} />
    );
  }
  if (schema.type === "boolean") {
    return (
      <SwitchInput
        value={value}
        onValue={onValue}
        label={schema.title || label}
      />
    );
  }
  return null;
}

const allTypesList = [
  "boolean",
  "string",
  "number",
  "null",
  "array",
  "object",
] as const;
function JSONSchemaForm({
  value,
  onValue,
  schema,
}: {
  value: any;
  onValue: (v: any) => void;
  schema: JSONSchema;
}) {
  if (schema === false) return null;
  let objSchema = schema;
  if (schema === true) objSchema = {};
  const type = schema?.type || allTypesList;
  let onlyType = Array.isArray(type) ? null : type;
  if (!onlyType && type.length === 1) {
    onlyType = type[0];
  }
  if (onlyType === "object") {
    return (
      <JSONSchemaObjectForm value={value} onValue={onValue} schema={schema} />
    );
  }
  if (onlyType === "string") {
    return (
      <JSONSchemaFieldForm
        label={objSchema?.title || "string"}
        value={value}
        onValue={onValue}
        schema={schema}
      />
    );
  }
  return null;
}

function ZActionNode({
  type,
  value,
  connection,
  path,
}: {
  type: any;
  value: any;
  connection: string;
  path: string[];
}) {
  const [actionValue, setActionValue] = useState(null);
  const conn = useConnection(connection);
  if (!conn) throw new Error("connection");

  return (
    <VStack>
      <JSONSchemaForm
        value={actionValue}
        onValue={setActionValue}
        schema={type.payload}
      />
      <AsyncButton
        title="Submit"
        primary
        onPress={async () => {
          const resp = await postZAction(conn, path, actionValue);
          console.log(resp);
        }}
      />
    </VStack>
  );
}

function ZGettableNode({
  type,
  value,
  connection,
  path,
}: {
  type: any;
  value: any;
  connection: string;
  path: string[];
}) {
  const { dispatch } = useNavigation();
  const childNames = value?.children || [];

  return <Paragraph>{JSON.stringify(value)}</Paragraph>;
}

function ZNode({ path, connection }: { path: string[]; connection: string }) {
  const { isLoading, data } = useZNode(path);
  const type = data?.type[".t"];
  let body = null;
  if (type === "Container") {
    body = (
      <ZContainerNode
        path={path}
        type={data?.type}
        value={data?.node}
        connection={connection}
      />
    );
  }
  if (type === "Group") {
    body = (
      <ZGroupNode
        path={path}
        type={data?.type}
        value={data?.node}
        connection={connection}
      />
    );
  }
  if (type === "Gettable") {
    body = (
      <ZGettableNode
        path={path}
        type={data?.type}
        value={data?.node}
        connection={connection}
      />
    );
  }
  if (type === "Action") {
    body = (
      <ZActionNode
        path={path}
        type={data?.type}
        value={data?.node}
        connection={connection}
      />
    );
  }
  console.log("node type", type);
  return (
    <>
      <PageTitle title={isLoading ? "... " : path.join("/")} />
      {body}
      {/* <Paragraph>{JSON.stringify({ data })}</Paragraph> */}
    </>
  );
}

export default function ZNodeScreen({
  navigation,
  route,
}: HomeStackScreenProps<"ZNode">) {
  const { connection, path } = route.params;
  const connections = useConnections();
  if (!connection) throw new Error("null connection");
  const conn = connections.find((conn) => conn.key === connection);
  if (!conn) throw new Error("Connection not found");
  return (
    <AppPage>
      <QueryConnectionProvider value={conn}>
        <ZNode path={path} connection={connection} />
      </QueryConnectionProvider>
    </AppPage>
  );
}
