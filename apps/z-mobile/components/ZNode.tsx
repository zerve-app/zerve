import React, { useMemo, useState } from "react";

import { HomeStackParamList, RootStackParamList } from "../app/Links";
import {
  AsyncButton,
  Button,
  HStack,
  InfoRow,
  LinkRowGroup,
  Paragraph,
  showErrorToast,
  Spinner,
  VStack,
} from "@zerve/ui";
import {
  pathStartsWith,
  postZAction,
  serverPost,
  useConnectionProjects,
  useConnection,
  useZNode,
  useZNodeStateWrite,
} from "@zerve/query";
import {
  ConnectionDefinition,
  Session,
  setSession,
  useSavedConnection,
} from "../app/ConnectionStorage";
import {
  CompositeNavigationProp,
  StackActions,
  useNavigation,
} from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { JSONSchemaForm } from "./JSONSchemaForm";
import { Icon } from "@zerve/ui/Icon";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getZIcon } from "../app/ZIcon";
import { storeHistoryEvent } from "../app/History";
import { displayStoreFileName, EmptySchemaStore } from "@zerve/core";
import { View } from "react-native";
import { JSONSchemaEditor } from "./JSONSchemaEditor";
import { showToast } from "../app/Toast";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, "HomeStack">,
  NativeStackNavigationProp<HomeStackParamList, "ZNode">
>;
export function ZInlineNode({ path }: { path: string[] }) {
  return <ZLoadedNode path={path} />;
}
export function ZContainerNode({
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
  const main = type?.meta?.main && type.children[type?.meta?.main];
  const index = type?.meta?.index && type.children[type?.meta?.index];

  const indexOrMain = main ? (
    <ZInlineNode path={[...path, type.meta.main]} />
  ) : index ? (
    <ZInlineNode path={[...path, type.meta.index]} />
  ) : null;

  return (
    <VStack>
      {indexOrMain}
      {!main && (
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
      )}
    </VStack>
  );
}

export function ZStateNode({
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
  const conn = useConnection();
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

export function ZStoreNode({
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

const LoginStrategies = [
  {
    icon: "mobile-phone",
    label: "Phone",
    key: "Phone",
    schema: {
      title: "Phone Number",
      placeholder: "12223334444",
      type: "string",
    },
  },
  {
    icon: "envelope",
    label: "Email",
    key: "Email",
    schema: {
      title: "Email Address",
      type: "string",
      format: "email",
    },
  },
] as const;

const CodeSchema = {
  title: "Code",
  type: "string",
  capitalize: "characters",
} as const;

function LoginStrategyForm({
  strategy,
  path,
  onCancel,
}: {
  strategy: typeof LoginStrategies[number]["key"];
  path: string[];
  onCancel?: () => void;
}) {
  const conn = useConnection();
  // uh assume the strategy is a message strategy idk.
  const strat = LoginStrategies.find((s) => s.key === strategy);
  if (!conn) throw new Error("QueryContext missing");
  if (!strat) throw new Error("Failed to look up this strategy");
  const { schema } = strat;
  const [address, setAddress] = useState<undefined | string>(undefined);
  const [token, setToken] = useState<undefined | string>(undefined);

  if (address) {
    return (
      <>
        <InfoRow label={strat.label} value={address} />
        <JSONSchemaEditor
          schema={CodeSchema}
          saveLabel="Log In"
          value={token}
          onValue={async (t: string) => {
            setToken(t);
            const session = await postZAction(
              conn,
              [...path, "createSession"],
              {
                strategy,
                payload: {
                  address,
                  token: t,
                },
              }
            );
            setSession(conn.key, {
              authPath: path,
              userLabel: address,
              userId: session.authUser,
              sessionToken: session.authPass,
            });
            showToast(`Logged in.`);
          }}
          schemaStore={EmptySchemaStore}
          onCancel={() => {
            setAddress(undefined);
          }}
        />
      </>
    );
  }

  return (
    <>
      <JSONSchemaEditor
        schema={schema}
        saveLabel="Send me a Code"
        value={address}
        onValue={async (address) => {
          await postZAction(conn, [...path, "createSession"], {
            strategy,
            payload: {
              address,
              token: null,
            },
          });
          setAddress(address);
          showToast(`Code sent to ${address}`);
        }}
        schemaStore={EmptySchemaStore}
        onCancel={onCancel}
      />
    </>
  );
}

function LoginForm({ path, authMeta }: { path: string[]; authMeta: any }) {
  const [selectedStrategy, setSelectedStrategy] = useState<
    null | typeof LoginStrategies[number]["key"]
  >(null);
  return (
    <VStack>
      {!selectedStrategy &&
        LoginStrategies.map((l) => (
          <Button
            key={l.key}
            title={l.label}
            left={(p) => (l.icon ? <Icon {...p} name={l.icon} /> : null)}
            onPress={() => {
              setSelectedStrategy(l.key);
            }}
          />
        ))}
      {selectedStrategy && (
        <LoginStrategyForm
          strategy={selectedStrategy}
          path={path}
          onCancel={() => {
            setSelectedStrategy(null);
          }}
        />
      )}
    </VStack>
  );
}

export function LoggedInAuthNode({
  type,
  value,
  connection,
  path,
  session,
}: {
  type: any;
  value: any;
  connection: ConnectionDefinition;
  session: Session;
  path: string[];
}) {
  return (
    <>
      <Paragraph>Welcome, {session.userLabel}.</Paragraph>
      <ZInlineNode path={[...path, "user"]} />
    </>
  );
}
export function ZAuthNode({
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
  if (type[".t"] !== "Container" || type?.meta?.zContract !== "Auth")
    throw new Error("Unexpected z type info for ZAuthNode");

  const conn = useSavedConnection(connection);
  if (!connection || !conn)
    return <Paragraph danger>Connection unavailable.</Paragraph>;

  if (conn.session) {
    if (pathStartsWith(path, conn.session.authPath)) {
      return (
        <LoggedInAuthNode
          type={type}
          value={value}
          connection={conn}
          session={conn.session}
          path={path}
        />
      );
    }
    return (
      <Paragraph>
        You are logged in at {conn.session.authPath.join("/")}. Log out first
        and then log in here, or create another connection to the same server
        and log in there.
      </Paragraph>
    );
  }

  // if not authenticated...
  return <LoginForm path={path} authMeta={type.meta} />;
  return (
    <>
      <Paragraph>This is Protected.</Paragraph>
    </>
  );
}

export function ZGroupNode({
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

export function ZActionNode({
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
  const conn = useSavedConnection(connection);
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

export function ZGettableNode({
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
  if (type[".t"] !== "Gettable")
    throw new Error("Unexpected z type for ZGettableNode");
  return <JSONSchemaForm value={value} schema={type.value} />;
}

export function ZObservableNode({
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
  if (type[".t"] !== "Observable")
    throw new Error("Unexpected z type for ZObservableNode");
  return <JSONSchemaForm value={value} schema={type.value} />;
}

export function ZStaticNode({
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
  const zStatic = value?.[".z"];
  const zStaticType = zStatic?.z;
  if (zStaticType === "Reference" && zStatic.path) {
    return <ZInlineNode path={[...path.slice(0, -1), ...zStatic.path]} />;
  } else if (Array.isArray(value)) {
    return value.map((childValue, childIndex) => {
      const zStatic = childValue?.[".z"];
      const zStaticType = zStatic?.z;
      if (zStaticType === "Reference" && zStatic.path) {
        return <ZInlineNode path={[...path.slice(0, -1), ...zStatic.path]} />;
      }
      return <JSONSchemaForm key={childIndex} value={childValue} schema={{}} />;
    });
  }
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
    } else if (zContract === "Auth") {
      body = (
        <ZAuthNode
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

function ErrorBox({ error }: { error: any }) {
  return (
    <Paragraph danger>
      Error: {error.message || JSON.stringify(error)}
    </Paragraph>
  );
}

export function ZLoadedNode({ path }: { path: string[] }) {
  const conn = useConnection();
  const { isLoading, data, refetch, error, isError, isRefetching } =
    useZNode(path);

  if (!conn) return null;

  return (
    <>
      {isLoading && <Spinner />}
      {isError && <ErrorBox error={error} />}
      <ZNode
        path={path}
        connection={conn.key}
        type={data?.type}
        value={data?.node}
      />
    </>
  );
}
