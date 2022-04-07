import React, { useState } from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import {
  AsyncButton,
  Button,
  IconButton,
  LinkRowGroup,
  Paragraph,
  VStack,
} from "@zerve/ui";
import { useBottomSheet } from "@zerve/ui-native";
import { postZAction, QueryConnectionProvider, useZNode } from "@zerve/query";
import { useConnection, useConnectionsMeta } from "../app/Connection";
import {
  CompositeNavigationProp,
  StackActions,
  useNavigation,
} from "@react-navigation/native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { Icon } from "@zerve/ui/Icon";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getZIcon } from "../app/ZIcon";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { appendHistoryAsync, storeHistoryEvent } from "../app/History";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "ZNode">
>;

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
  const { dispatch } = useNavigation<NavigationProp>();
  const childNames = Object.keys(type.children);
  return (
    <VStack>
      <LinkRowGroup
        links={childNames.map((childName) => ({
          key: childName,
          title: childName,
          icon: getZIcon(type.children[childName][".t"]),
          onPress: () => {
            dispatch(
              StackActions.push("ZNode", {
                connection,
                path: [...path, childName],
              })
            );
          },
        }))}
      />
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
  const { dispatch } = useNavigation<NavigationProp>();
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
  const { navigate } = useNavigation<NavigationProp>();
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
          const response = await postZAction(conn, path, actionValue);
          const eventId = await storeHistoryEvent("ServerAction", {
            action: actionValue,
            response,
            connection,
            path,
          });
          navigate("HistoryEvent", { eventId });
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
  return <JSONSchemaForm value={value} schema={type.value} />;
}

function ZObservableNode({
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
  if (type[".t"] !== "Observable")
    throw new Error("Unexpected z type for ZObservableNode");
  return <JSONSchemaForm value={value} schema={type.value} />;
}

function ZStaticNode({
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
  return <JSONSchemaForm value={value} schema={{}} />;
}

function ZNodePage({
  path,
  connection,
}: {
  path: string[];
  connection: string;
}) {
  const { isLoading, data, refetch, isRefetching } = useZNode(path);
  const { navigate } = useNavigation<NavigationProp>();
  const type = data?.type[".t"];
  let body = null;
  if (type === "Static") {
    body = (
      <ZStaticNode
        path={path}
        type={data?.type}
        value={data?.node}
        connection={connection}
      />
    );
  }
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
  if (type === "Observable") {
    body = (
      <ZObservableNode
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
        title="Refresh"
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
      <ScreenHeader
        isLoading={isLoading || isRefetching}
        title={path.length ? path.join("/") : "Z Connection API"}
        onLongPress={onOptions}
        corner={
          <IconButton
            altTitle="Options"
            onPress={onOptions}
            icon={(p) => <FontAwesome {...p} name="ellipsis-h" />}
          />
        }
      ></ScreenHeader>
      {body}
    </>
  );
}

export default function ZNodeScreen({
  navigation,
  route,
}: HomeStackScreenProps<"ZNode">) {
  const { connection, path } = route.params;
  const connections = useConnectionsMeta();
  if (!connection) throw new Error("null connection");
  const conn = connections.find((conn) => conn.key === connection);
  if (!conn) throw new Error("Connection not found");
  return (
    <QueryConnectionProvider value={conn}>
      <ScreenContainer scroll>
        <ZNodePage path={path} connection={connection} />
      </ScreenContainer>
    </QueryConnectionProvider>
  );
}
