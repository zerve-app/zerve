import React, { useMemo, useState } from "react";

import {
  HomeStackParamList,
  HomeStackScreenProps,
  RootStackParamList,
} from "../app/Links";
import {
  AsyncButton,
  Button,
  HStack,
  IconButton,
  LinkRowGroup,
  Paragraph,
  Spinner,
  VStack,
} from "@zerve/ui";
import { useActionsSheet, useBottomSheet } from "@zerve/ui-native";
import {
  postZAction,
  QueryConnectionProvider,
  useConnectionProjects,
  useQueryContext,
  useZNode,
  useZNodeStateWrite,
  useZNodeValue,
} from "@zerve/query";
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
import {
  BooleanSchema,
  BooleanSchemaSchema,
  displayStoreFileName,
} from "@zerve/core";
import { View } from "react-native";

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
          icon: getZIcon(type.children[childName]),
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

function ZStateNode({
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
  const writeNode = useZNodeStateWrite(path);
  if (type[".t"] !== "Container" || type?.meta?.zContract !== "State")
    throw new Error("Unexpected z type info for ZStateNode");

  const { data: node, isLoading } = useZNode(
    useMemo(() => [...path, "state"], [path])
  );
  if (isLoading) return <Spinner />;
  return (
    <JSONSchemaForm
      value={node?.node}
      schema={node?.type?.value}
      onValue={(value) => {
        writeNode.mutate(value);
      }}
    />
  );
}

export function NewFileButton({ path }: { path: string[] }) {
  const navigation = useNavigation<NavigationProp>();
  const conn = useQueryContext();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 12,
      }}
    >
      <Button
        onPress={() => {
          navigation.navigate("NewFile", {
            connection: conn?.key || null,
            storePath: path,
          });
        }}
        small
        title="New File"
        left={({ color }) => (
          <FontAwesome name="plus-circle" color={color} size={24} />
        )}
      />
    </View>
  );
}

function StoreChildList({
  list,
  connection,
  storePath,
}: {
  list: Array<{ key: string; name: string }>;
  connection: string;
  storePath: string[];
}) {
  const { navigate } = useNavigation<NavigationProp>();
  if (!list?.length) return <Paragraph>No files here.</Paragraph>;

  return (
    <LinkRowGroup
      links={list.map((child) => ({
        key: child.key,
        title: displayStoreFileName(child.name),
        icon: "list-ul",
        onPress: () => {
          navigate("File", {
            connection,
            storePath,
            name: child.key,
          });
        },
      }))}
    />
  );
}

function ZStoreNode({
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
  if (type[".t"] !== "Container" || type?.meta?.zContract !== "Store")
    throw new Error("Unexpected z type info for ZStoreNode");

  const { navigate } = useNavigation<NavigationProp>();
  const { data, refetch, isLoading } = useConnectionProjects(path);
  const list = useMemo(() => {
    return Object.entries(data?.node || {})
      .filter(([childName]) => {
        return childName !== "$schemas";
      })
      .map(([name, docValue]) => {
        return { key: name, name, ...docValue };
      });
  }, [data]);

  // useEffect(() => {
  //   const actions: ActionButtonDef[] = [];
  //   if (refetch && !isLoading) {
  //     actions.push({
  //       key: "refresh",
  //       icon: "refresh",
  //       title: "Refresh",
  //       onPress: refetch,
  //     });
  //   }
  //   onActions(actions);
  // }, [isLoading, refetch]);

  if (!connection) return <Paragraph danger>Connection unavailable.</Paragraph>;

  return (
    <>
      <StoreChildList list={list} connection={connection} storePath={path} />
      <HStack>
        <NewFileButton path={path} />
      </HStack>
      <LinkRowGroup
        links={[
          {
            key: "Events",
            title: "Event History",
            icon: "history",
            onPress: () => {
              navigate("ChainHistory", {
                connection,
                storePath: path,
              });
            },
          },
          {
            key: "ServerSchemas",
            title: "Schemas",
            icon: "crosshairs",
            onPress: () => {
              navigate("ChainSchemas", {
                connection,
                storePath: path,
              });
            },
          },
        ]}
      />
    </>
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

export function ZNode({
  path,
  connection,
  type,
  value,
}: {
  path: string[];
  connection: string;
  type: any;
  value: any;
}) {
  const typeName = type?.[".t"];
  const typeMeta = type?.meta;
  let body = null;
  if (typeName === "Static") {
    body = (
      <ZStaticNode
        path={path}
        type={type}
        value={value}
        connection={connection}
      />
    );
  }
  if (typeName === "Container") {
    const zContract = typeMeta?.zContract;
    if (zContract === "State") {
      body = (
        <ZStateNode
          path={path}
          type={type}
          value={value}
          connection={connection}
        />
      );
    } else if (zContract === "Store") {
      body = (
        <ZStoreNode
          path={path}
          type={type}
          value={value}
          connection={connection}
        />
      );
    } else {
      zContract && console.warn(`Unhandled zContract: ${zContract}`);
      body = (
        <ZContainerNode
          path={path}
          type={type}
          value={value}
          connection={connection}
        />
      );
    }
  }
  if (typeName === "Group") {
    body = (
      <ZGroupNode
        path={path}
        type={type}
        value={value}
        connection={connection}
      />
    );
  }
  if (typeName === "Gettable") {
    body = (
      <ZGettableNode
        path={path}
        type={type}
        value={value}
        connection={connection}
      />
    );
  }
  if (typeName === "Observable") {
    body = (
      <ZObservableNode
        path={path}
        type={type}
        value={value}
        connection={connection}
      />
    );
  }
  if (typeName === "Action") {
    body = (
      <ZActionNode
        path={path}
        type={type}
        value={value}
        connection={connection}
      />
    );
  }
  return body;
}

export function ZNodePage({
  path,
  connection,
}: {
  path: string[];
  connection: string;
}) {
  const { isLoading, data, refetch, isRefetching } = useZNode(path);
  const { navigate } = useNavigation<NavigationProp>();

  const onOptions = useActionsSheet(() => [
    {
      title: "Refresh",
      icon: "refresh",
      onPress: refetch,
    },
    {
      title: "Raw Type",
      icon: "code",
      onPress: () => {
        navigate("RawValue", {
          title: `${path.join("/")} Type`,
          value: data?.type,
        });
      },
    },
    {
      title: "Raw Value",
      icon: "code",
      onPress: () => {
        navigate("RawValue", {
          title: `${path.join("/")} Value`,
          value: data?.node,
        });
      },
    },
  ]);

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
      <ZNode
        path={path}
        connection={connection}
        type={data?.type}
        value={data?.node}
      />
    </>
  );
}

export function ZLoadedNode({ path }: { path: string[] }) {
  const conn = useQueryContext();
  const { isLoading, data, refetch, isRefetching } = useZNode(path);
  const { navigate } = useNavigation<NavigationProp>();
  console.log("HI ZLoadedNode", { path, conn, isLoading, data });
  if (!conn) return null;

  return (
    <>
      {isLoading && <Spinner />}
      <ZNode
        path={path}
        connection={conn.key}
        type={data?.type}
        value={data?.node}
      />
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
