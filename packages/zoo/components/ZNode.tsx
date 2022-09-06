import React, { ComponentProps, useCallback, useMemo, useState } from "react";

import {
  ActionButtonDef,
  AsyncButton,
  Button,
  HStack,
  LinkRowGroup,
  Paragraph,
  Spinner,
  VStack,
} from "@zerve/zen";
import { pathStartsWith, postZAction } from "@zerve/zoo-client/ServerCalls";
import { useZNode, useConnectionProjects } from "@zerve/zoo-client/Query";
import { useZNodeStateWrite } from "@zerve/zoo-client/Mutation";
import {
  useConnection,
  SavedSession,
  Connection,
  UnauthorizedSymbol,
} from "@zerve/zoo-client/Connection";
import { setSessionUserId } from "../app/ConnectionStorage";
import {
  useConnectionNavigation,
  useGlobalNavigation,
  useStoreNavigation,
} from "../app/useNavigation";
import { FontAwesome } from "@expo/vector-icons";
import { JSONSchemaEditor } from "@zerve/zen/JSONSchemaEditor";
import { Icon } from "@zerve/zen/Icon";
import { getZIcon } from "../app/ZIcon";
import { storeHistoryEvent } from "../app/History";
import {
  ActionResponseSchema,
  displayStoreFileName,
  EmptySchemaStore,
  FromSchema,
  GenericError,
  getDefaultSchemaValue,
  RedirectSchema,
} from "@zerve/zed";
import { View } from "react-native";
import { useTextInputFormModal } from "@zerve/zen/TextInputFormModal";
import { isSeeminglyAnonUser, LoginForm, LogoutButton } from "./Auth";
import { Notice } from "@zerve/zen/Notice";
import { useQueryClient } from "react-query";

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
  console.log("metaaaa", type?.meta);

  return (
    <VStack>
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
    useMemo(() => [...path, "state"], [path]),
  );
  if (isLoading) return <Spinner />;
  return (
    <JSONSchemaEditor
      id={path.join("/")}
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
  const { openNewEntry } = useStoreNavigation(path);
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
          openNewEntry();
        }}
        small
        title="New Entry"
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
  const { openEntry } = useStoreNavigation(storePath);
  if (!list?.length) return <Paragraph>No files here.</Paragraph>;

  return (
    <LinkRowGroup
      links={list.map((child) => ({
        key: child.key,
        title: displayStoreFileName(child.name),
        icon: "list-ul",
        onPress: () => {
          openEntry(child.key);
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

export function ChangeUsernameButton({
  connection,
  session,
  onUserIdChange,
}: {
  connection: Connection;
  session: SavedSession;
  onUserIdChange?: (userId: string) => void;
}) {
  const promptNewUserName = useTextInputFormModal<void>(() => {
    return {
      inputLabel: "New User Name",
      defaultValue: isSeeminglyAnonUser(session.userId) ? "" : session.userId,
      onValue: (username) => {
        postZAction(
          connection,
          [...session.authPath, "user", "setUsername"],
          username,
        )
          .then(() => {
            onUserIdChange?.(username);
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

export function ChangePasswordButton({
  connection,
  session,
}: {
  connection: Connection;
  session: SavedSession;
}) {
  const promptNewPassword = useTextInputFormModal<void>(() => {
    return {
      inputLabel: "New Password",
      defaultValue: "",
      secureTextEntry: true,
      onValue: async (password) => {
        await postZAction(
          connection,
          [...session.authPath, "user", "setPassword"],
          {
            newPassword: password,
          },
        );
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
  connection: Connection;
  session: SavedSession;
  path: string[];
}) {
  return (
    <VStack>
      <Paragraph>Welcome, {session.userLabel}.</Paragraph>
      <ZLoadedNode path={[...path, "user"]} />
      <LogoutButton connection={connection} session={session} />
      {/* <ChangeUsernameButton connection={connection} session={session} />
      <ChangePasswordButton connection={connection} session={session} /> */}
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
    console.log("Your path: ", path);
    console.log("Session Path: ", conn.session.authPath);
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
  const staticMetaValue = type.meta?.zStatic;
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
      {staticMetaValue && (
        <ZStaticNode
          value={staticMetaValue}
          connection={connection}
          path={path}
        />
      )}
    </VStack>
  );
}

function useZActionResponse(connectionKey: string) {
  const { openZ, replaceZ } = useConnectionNavigation();
  const { openHistoryEvent } = useGlobalNavigation();
  const queryClient = useQueryClient();
  return useCallback((response: any, eventId: string) => {
    if (extractZContract(response) === "Response") {
      const { redirect, invalidate } = response as FromSchema<
        typeof ActionResponseSchema
      >;
      if (invalidate) {
        if (extractZContract(invalidate) === "Invalidate") {
          invalidate.paths.forEach((path) => {
            queryClient.invalidateQueries([connectionKey, "z", ...path]);
          });
        }
      }
      if (redirect) {
        if (extractZContract(redirect) === "Redirect") {
          if (redirect.replace) {
            replaceZ(redirect.path);
            return;
          }
          openZ(redirect.path);
          return;
        }
      }
    }
    openHistoryEvent(eventId);
  }, []);
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
  const [actionValue, setActionValue] = useState(
    getDefaultSchemaValue(type.payload),
  );
  const [error, setError] = useState<null | GenericError>(null);
  const conn = useConnection();

  const handleResponse = useZActionResponse(connection);
  if (!conn) throw new Error("connection");

  return (
    <VStack>
      {error && <Paragraph>{error.message}</Paragraph>}
      <JSONSchemaEditor
        id={`action-${path.join("-")}`}
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
          handleResponse(response, eventId);
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
  return (
    <JSONSchemaEditor
      id={`gettable-${path.join("-")}`}
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
      id={`observable-${path.join("-")}`}
      value={value}
      schema={type.value}
      schemaStore={EmptySchemaStore}
    />
  );
}

function extractZContract(value: any) {
  if (value == null) return null;
  if (typeof value === "object") return value.zContract;
  return null;
}

export function ZStaticNode({
  value,
  connection,
  path,
}: {
  value: any;
  connection: string;
  path: string[];
}) {
  if (extractZContract(value) === "ReferenceList") {
    return (
      <ZReferenceListNode path={path} value={value} connection={connection} />
    );
  }
  if (Array.isArray(value)) {
    return (
      <>
        {value.map((childValue, childIndex) => {
          return (
            <JSONSchemaEditor
              key={childIndex}
              value={childValue}
              schema={true}
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
      schema={true}
      schemaStore={EmptySchemaStore}
    />
  );
}

export function ZReferenceListNode({
  path,
  connection,
  value,
}: {
  path: string[];
  connection: string;
  value: any;
}) {
  const { openZ } = useConnectionNavigation();
  return (
    <LinkRowGroup
      links={value.items.map((item) => ({
        key: item.key,
        title: item.name,
        icon: item.icon,
        onPress: () => {
          openZ(item.path);
        },
      }))}
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
    if (typeMeta?.zIndex) {
      body = <ZInlineNode path={[...path, ...typeMeta?.zIndex]} />;
    } else if (zContract === "State") {
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

export function ZLoadedNode({
  path,
  onActions,
}: {
  path: string[];
  onActions?: (actions: ActionButtonDef[]) => void;
}) {
  const conn = useConnection();
  const { isLoading, data, refetch, error, isError, isRefetching } =
    useZNode(path);

  React.useEffect(() => {
    onActions?.([
      {
        title: "Refresh",
        key: "refresh",
        icon: "refresh",
        onPress: () => {
          refetch();
        },
      },
    ]);
  }, [refetch]);
  if (!conn) return null;

  return (
    <>
      {isLoading && <Spinner />}
      {(data?.node === UnauthorizedSymbol ||
        data?.type === UnauthorizedSymbol) && (
        <Notice
          danger
          message="You are not authorized to view this. Please log out and log back in."
        />
      )}
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

export function extractNodeTitle(
  path: string[],
  type: any,
  value: any,
): string {
  const metaTitle = type?.meta?.title;
  if (metaTitle) return metaTitle;
  return path.length ? path.join("/") : "Zerve";
}

export function extractNodeIcon(
  path: string[],
  type: any,
  value: any,
): ComponentProps<typeof Icon>["name"] | null {
  const metaTitle = type?.meta?.icon;
  if (metaTitle) return metaTitle;
  return null;
}
