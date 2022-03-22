import React, {
  ComponentProps,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { HomeStackParamList, HomeStackScreenProps } from "../app/Links";
import AppPage from "../components/AppPage";
import {
  AsyncButton,
  Button,
  IconButton,
  LinkRow,
  PageTitle,
  Paragraph,
  Spinner,
  useBottomSheet,
  VStack,
} from "@zerve/ui";
import { postZAction, QueryConnectionProvider, useZNode } from "@zerve/query";
import { useConnection, useConnections } from "../app/Connection";
import { StackActions, useNavigation } from "@react-navigation/native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { Icon } from "@zerve/ui/Icon";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getZIcon } from "../app/ZIcon";

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
        <LinkRow
          title={childName}
          key={childName}
          icon={getZIcon(type.children[childName][".t"])}
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
      <JSONSchemaForm value={value} schema={type.value} />
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
        title={type.payload?.submitLabel || "Submit"}
        primary
        right={(p) => <Icon name="play" {...p} />}
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
  if (type[".t"] !== "Gettable")
    throw new Error("Unexpected z type for ZGettableNode");
  return (
    <Paragraph>
      <JSONSchemaForm value={value} schema={type.value} />
    </Paragraph>
  );
}

function ZNodePage({
  path,
  connection,
}: {
  path: string[];
  connection: string;
}) {
  const { isLoading, data, refetch, isRefetching } = useZNode(path);
  const { navigate } =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
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
  const onOptions = useBottomSheet(({ onClose }) => (
    <VStack>
      <Button
        title="Reload"
        left={(p) => <Icon {...p} name="refresh" />}
        onPress={() => {
          refetch();
          onClose();
        }}
      />
      <Button
        title="Raw Type"
        left={(p) => <MaterialCommunityIcons {...p} name="code-json" />}
        onPress={() => {
          onClose();
          navigate("RawValue", {
            title: `${path.join("/")} Type`,
            value: data?.type,
          });
        }}
      />
      <Button
        title="Raw Value"
        left={(p) => <MaterialCommunityIcons {...p} name="code-json" />}
        onPress={() => {
          onClose();
          navigate("RawValue", {
            title: `${path.join("/")} Value`,
            value: data?.node,
          });
        }}
      />
    </VStack>
  ));
  return (
    <>
      {(isLoading || isRefetching) && <Spinner />}
      <IconButton
        altTitle="Options"
        onPress={onOptions}
        icon={(p) => <FontAwesome {...p} name="ellipsis-h" />}
      />
      <PageTitle title={path.join("/")} />
      {body}
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
    <QueryConnectionProvider value={conn}>
      <AppPage>
        <ZNodePage path={path} connection={connection} />
      </AppPage>
    </QueryConnectionProvider>
  );
}
