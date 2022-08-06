import React, { useMemo, useState, useEffect } from "react";

import { HomeStackParamList, RootStackParamList } from "../app/Links";
import {
  AsyncButton,
  Button,
  HStack,
  InfoRow,
  LinkRowGroup,
  Paragraph,
  Spinner,
  VStack,
} from "@zerve/zen";

import { pathStartsWith, postZAction } from "@zerve/client/ServerCalls";
import { useZNode, useConnectionProjects } from "@zerve/client/Query";
import { useZNodeStateWrite } from "@zerve/client/Mutation";
import {
  useConnection,
  SavedSession,
  LiveConnection,
  serverPost,
} from "@zerve/client/Connection";
import {
  forceLocalLogout,
  logout,
  setSession,
  setSessionUserId,
} from "../app/ConnectionStorage";
import {
  useConnectionNavigation,
  useGlobalNavigation,
  useStoreNavigation,
} from "../app/useNavigation";
import { FontAwesome } from "@expo/vector-icons";
import { JSONSchemaEditor } from "./JSONSchemaEditor";
import { Icon } from "@zerve/zen/Icon";
import { getZIcon } from "../app/ZIcon";
import { storeHistoryEvent } from "../app/History";
import {
  displayStoreFileName,
  EmailSchema,
  EmptySchemaStore,
  JSONSchema,
  PhoneSchema,
  ZSchema,
  GenericError,
} from "@zerve/core";
import { View } from "react-native";
import { JSONSchemaForm } from "./JSONSchemaForm";
import { showToast } from "../app/Toast";
import { ZLoadedNode } from "./ZLoadedNode";
import { useTextInputFormModal } from "./TextInputFormModal";
import { LoginForm } from "./Auth";

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
  const { openZ } = useConnectionNavigation();
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
              openZ([...path, childName]);
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
    <JSONSchemaEditor
      value={node?.node}
      schema={node?.type?.value}
      onValue={(value) => {
        writeNode.mutate(value);
      }}
      schemaStore={EmptySchemaStore}
    />
  );
}

export function NewFileButton({ path }: { path: string[] }) {
  const { openNewFile } = useStoreNavigation(path);
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
          openNewFile();
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
  const { openFile } = useStoreNavigation(storePath);
  if (!list?.length) return <Paragraph>No files here.</Paragraph>;

  return (
    <LinkRowGroup
      links={list.map((child) => ({
        key: child.key,
        title: displayStoreFileName(child.name),
        icon: "list-ul",
        onPress: () => {
          openFile(child.key);
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
  const { openHistory, openSchemas } = useStoreNavigation(path);
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
    <VStack>
      <StoreChildList list={list} connection={connection} storePath={path} />
      <HStack>
        <NewFileButton path={path} />
      </HStack>
      <LinkRowGroup
        links={[
          {
            key: "Events",
            title: "Change History",
            icon: "history",
            onPress: () => {
              openHistory();
            },
          },
          {
            key: "ServerSchemas",
            title: "Schemas",
            icon: "crosshairs",
            onPress: () => {
              openSchemas();
            },
          },
        ]}
      />
    </VStack>
  );
}

function LogoutButton({
  connection,
  session,
}: {
  connection: LiveConnection;
  session: SavedSession;
}) {
  const [readyForForceLogout, setReadyForForceLogout] = useState(false);
  return (
    <>
      <AsyncButton
        onPress={async () => {
          try {
            await logout(connection, session);
          } catch (e) {
            setReadyForForceLogout(true);
            throw e;
          }
        }}
        title="Log Out"
      />
      {readyForForceLogout && (
        <AsyncButton
          onPress={async () => {
            await forceLocalLogout(connection);
          }}
          title="Force Log Out (delete session)"
        />
      )}
    </>
  );
}

function ChangeUsernameButton({
  connection,
  session,
}: {
  connection: LiveConnection;
  session: SavedSession;
}) {
  const promptNewUserName = useTextInputFormModal<void>(() => {
    return {
      inputLabel: "New User Name",
      defaultValue: session.userId || "?",
      onValue: (username) => {
        postZAction(
          connection,
          [...session.authPath, "user", "setUsername"],
          username
        )
          .then(() => {
            setSessionUserId(connection.key, username);
          })
          .catch((e) => {
            console.log("catch failed username change");
            throw e;
          });
      },
    };
  });

  return (
    <Button
      onPress={() => {
        promptNewUserName();
      }}
      title="Set Username"
    />
  );
}

function ChangePasswordButton({
  connection,
  session,
}: {
  connection: LiveConnection;
  session: SavedSession;
}) {
  const promptNewPassword = useTextInputFormModal<void>(() => {
    return {
      inputLabel: "New Password",
      defaultValue: "",
      onValue: (password) => {
        postZAction(connection, [...session.authPath, "user", "setPassword"], {
          newPassword: password,
        })
          .then(() => {
            setSessionUserId(connection.key, password);
          })
          .catch((e) => {
            console.log("catch failed Password change");
            throw e;
          });
      },
    };
  });

  return (
    <Button
      onPress={() => {
        promptNewPassword();
      }}
      title="Set Password"
    />
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
  connection: LiveConnection;
  session: SavedSession;
  path: string[];
}) {
  return (
    <VStack>
      <Paragraph>Welcome, {session.userLabel}.</Paragraph>
      <ZLoadedNode
        path={[...path, "user"]}

        // map={(z) => {
        //   // filter out setUsername, setPassword
        // }}
      />
      <LogoutButton connection={connection} session={session} />
      <ChangeUsernameButton connection={connection} session={session} />
      <ChangePasswordButton connection={connection} session={session} />
    </VStack>
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

  const conn = useConnection();
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
  const childNames = value?.children || [];
  const { openZ } = useConnectionNavigation();

  return (
    <VStack>
      {childNames.length === 0 ? <Paragraph>Nothing here</Paragraph> : null}
      {/* <JSONSchemaForm value={value} schema={type.value} /> */}
      {childNames.map((childName: string) => (
        <Button
          title={childName}
          key={childName}
          onPress={() => {
            openZ([...path, childName]);
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
  const [error, setError] = useState<null | GenericError>(null);
  const conn = useConnection();

  const { openHistoryEvent } = useGlobalNavigation();
  if (!conn) throw new Error("connection");

  return (
    <>
      {error && <Paragraph>{error.message}</Paragraph>}
      <JSONSchemaEditor
        value={actionValue}
        onValue={setActionValue}
        schema={type.payload}
        schemaStore={EmptySchemaStore}
      />
      <AsyncButton
        title={type.payload?.submitLabel || "Submit"}
        primary
        onCatch={(e) => {
          setError(e);
        }}
        right={(p) => <Icon name="play" {...p} />}
        onPress={async () => {
          setError(null);
          const response = await postZAction(conn, path, actionValue);
          const eventId = await storeHistoryEvent("ServerAction", {
            action: actionValue,
            response,
            connection,
            path,
          });
          openHistoryEvent(eventId);
        }}
      />
    </>
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
  return (
    <JSONSchemaEditor
      value={value}
      schema={type.value}
      schemaStore={EmptySchemaStore}
    />
  );
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
  return (
    <JSONSchemaEditor
      value={value}
      schema={type.value}
      schemaStore={EmptySchemaStore}
    />
  );
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
    return (
      <>
        {value.map((childValue, childIndex) => {
          const zStatic = childValue?.[".z"];
          const zStaticType = zStatic?.z;
          if (zStaticType === "Reference" && zStatic.path) {
            return (
              <ZInlineNode path={[...path.slice(0, -1), ...zStatic.path]} />
            );
          }
          return (
            <JSONSchemaEditor
              key={childIndex}
              value={childValue}
              schema={{}}
              schemaStore={EmptySchemaStore}
            />
          );
        })}
      </>
    );
  }
  return (
    <JSONSchemaEditor
      value={value}
      schema={{}}
      schemaStore={EmptySchemaStore}
    />
  );
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

export function ErrorBox({ error }: { error: any }) {
  return (
    <Paragraph danger>
      Error: {error.message || JSON.stringify(error)}
    </Paragraph>
  );
}
