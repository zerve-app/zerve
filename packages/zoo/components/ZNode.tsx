import React, { ComponentProps, useCallback, useMemo, useState } from "react";

import {
  ActionButtonDef,
  AsyncButton,
  Button,
  HGroup,
  JSONSchemaEditorContext,
  LinkButton,
  LinkRowGroup,
  PageSection,
  Paragraph,
  Spinner,
  VPadding,
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
} from "../app/useNavigation";
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
  lookUpValue,
} from "@zerve/zed";
import { View } from "react-native";
import { useTextInputFormModal } from "@zerve/zen/TextInputFormModal";
import { isSeeminglyAnonUser, LoginForm, LogoutButton } from "./Auth";
import { Notice } from "@zerve/zen/Notice";
import { useQueryClient } from "react-query";
import { useStoreNavigation } from "../app/useStoreNavigation";
import { StoreNavigationProvider } from "../app/StoreNavigationProvider";
import { StoreFeatureLink } from "../context/StoreDashboardContext";
import { useNavigation } from "@react-navigation/native";
import { NavLink, NavLinkContentGroup } from "@zerve/zen/NavLink";

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
  return (
    <VStack padded>
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

export function NewEntryButton() {
  const { openNewEntry } = useStoreNavigation();
  return (
    <Button
      onPress={() => {
        openNewEntry();
      }}
      small
      inline
      title="New Entry"
      left={(props) => <Icon name="plus-circle" {...props} />}
    />
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
  if (!list?.length) return <Paragraph>No entries yet.</Paragraph>;
  return (
    <NavLinkContentGroup>
      {list?.map((child) => {
        return (
          <StoreFeatureLink
            key={child.key}
            to={{
              key: "entries",
              entryName: child.name,
            }}
            title={displayStoreFileName(child.name)}
          />
        );
      })}
    </NavLinkContentGroup>
  );
}

function ZStoreLinks() {
  const { openSettings, openSchemas } = useStoreNavigation();
  return (
    <LinkRowGroup
      links={[
        {
          key: "schemas",
          title: "Schemas",
          icon: "crosshairs",
          onPress: () => {
            openSchemas();
          },
        },
        {
          key: "settings",
          title: "Store Settings",
          icon: "gear",
          onPress: () => {
            openSettings();
          },
        },
      ]}
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
    <StoreNavigationProvider
      connection={connection}
      storePath={path}
      feature={{ key: "entries" }}
      render={({ isActive }) => (
        <>
          <StoreChildList
            list={list}
            connection={connection}
            storePath={path}
          />
          <VStack padded>
            <HGroup>
              <NewEntryButton />
            </HGroup>
            <ZStoreLinks />
          </VStack>
        </>
      )}
    />
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
    <>
      <PageSection title={`Signed in as ${session.userLabel}`}>
        <ZLoadedNode path={[...path, "user"]} />
        <VStack padded>
          <LogoutButton connection={connection} session={session} />
        </VStack>
      </PageSection>
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
  const { openAuthIn } = useGlobalNavigation();
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
  return (
    <PageSection title="Welcome! You are not yet signed in.">
      <VStack padded>
        <Button
          title="Log In / Register"
          left={(p) => <Icon {...p} name="user" />}
          onPress={() => {
            openAuthIn(connection, path);
          }}
        />
      </VStack>
    </PageSection>
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
  const childNames = value?.children || [];
  const { openZ } = useConnectionNavigation();
  const staticMetaValue = type.meta?.zStatic;
  return (
    <>
      {childNames.length === 0 ? <Paragraph>Nothing here</Paragraph> : null}
      <NavLinkContentGroup>
        {childNames.map((childName: string) => (
          <NavLink
            title={childName}
            key={childName}
            onPress={() => {
              openZ([...path, childName]);
            }}
          />
        ))}
      </NavLinkContentGroup>
      <VStack padded>
        {staticMetaValue && (
          <ZStaticNode
            value={staticMetaValue}
            connection={connection}
            path={path}
            inline
          />
        )}
      </VStack>
    </>
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
  console.log("ZActionNode", { type, value });
  const [actionValue, setActionValue] = useState(
    getDefaultSchemaValue(type.payload),
  );
  const [error, setError] = useState<null | GenericError>(null);
  const conn = useConnection();

  const handleResponse = useZActionResponse(connection);
  if (!conn) throw new Error("connection");

  return (
    <VStack padded>
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
        left={(p) => {
          let iconName = type.payload?.submitIcon;
          if (iconName === undefined) iconName = "play";
          return iconName ? <Icon name={iconName} {...p} /> : null;
        }}
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
  const { openRawJSON } = useGlobalNavigation();
  return (
    <VStack padded>
      <JSONSchemaEditorContext.Provider
        value={{
          openChildEditor: (key: string) => {
            openRawJSON(key, lookUpValue(value, key));
          },
        }}
      >
        <JSONSchemaEditor
          id={`gettable-${path.join("-")}`}
          value={value}
          schema={type.value}
          schemaStore={EmptySchemaStore}
        />
      </JSONSchemaEditorContext.Provider>
    </VStack>
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
  inline,
}: {
  value: any;
  connection: string;
  path: string[];
  inline?: boolean;
}) {
  if (extractZContract(value) === "ReferenceList") {
    return <ZReferenceListNode value={value} inline={inline} />;
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
  value,
  inline,
}: {
  value: any;
  inline?: boolean;
}) {
  const { openZ } = useConnectionNavigation();
  if (inline)
    return (
      <HGroup>
        {value.items.map((item) => {
          if (item.inline) {
            return <ZInlineNode key={item.key} path={item.path} />;
          }
          return (
            <Button
              key={item.key}
              title={item.name}
              left={item.icon ? (p) => <Icon name={item.icon} {...p} /> : null}
              inline
              onPress={() => {
                openZ(item.path);
              }}
            />
          );
        })}
      </HGroup>
    );
  const hasInlineItem = value.items.find((i) => !!i.inline);
  if (!hasInlineItem) {
    return (
      <VStack padded>
        <LinkRowGroup
          links={value.items.map((item) => ({
            title: item.name,
            key: item.key,
            icon: item.icon,
            onPress: () => {
              openZ(item.path);
            },
          }))}
        />
      </VStack>
    );
  }
  return (
    <VStack>
      {value.items.map((item) => {
        if (item.inline) {
          return <ZInlineNode key={item.key} path={item.path} />;
        }
        return (
          <VPadding>
            <LinkButton
              nativePress={() => {
                openZ(item.path);
              }}
              left={item.icon ? (p) => <Icon {...p} name={item.icon} /> : null}
              title={item.name}
              key={item.key}
              href="uhh"
            />
          </VPadding>
        );
      })}
    </VStack>
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
    body = <ZStaticNode path={path} value={value} connection={connection} />;
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
    <VStack padded>
      <Notice
        danger
        message={`Error: ${error.message || JSON.stringify(error)}`}
      />
    </VStack>
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
  const { isLoading, data, refetch, error, isError } = useZNode(path);

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
