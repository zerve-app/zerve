import {
  Connection,
  SavedSession,
  useConnection,
} from "@zerve/client/Connection";
import { postZAction } from "@zerve/client/ServerCalls";
import {
  EmailSchema,
  EmptySchemaStore,
  PhoneSchema,
  ZSchema,
} from "@zerve/core";
import {
  AsyncButton,
  Button,
  Icon,
  JSONSchemaForm,
  showToast,
  Title,
  VStack,
} from "@zerve/zen";
import { useState } from "react";
import { forceLocalLogout, logout, setSession } from "../app/ConnectionStorage";

const LoginStrategies = [
  {
    icon: "mobile-phone",
    label: "Phone",
    key: "Phone",
    schema: PhoneSchema,
    title: "Log In / Register with SMS code",
  },
  {
    icon: "envelope",
    label: "Email",
    key: "Email",
    schema: EmailSchema,
    title: "Log In / Register with Email",
  },
  {
    icon: "user",
    label: "User + Password",
    key: "Username",
    schema: {
      title: "Password",
      type: "string",
      minLength: 6,
    },
    title: "Log In with Username + Password",
  },
] as const;

const CodeSchema = {
  title: "Code",
  type: "string",
  capitalize: "characters",
} as const;

export function isSeeminglyAnonUser(userId: string) {
  return userId.length === 11 && userId[3] === "-" && userId[7] === "-";
}

export function getUserDisplayName(userId: string) {
  if (isSeeminglyAnonUser(userId)) return "Anon";
  return userId;
}

function LoginStrategyForm({
  strategy,
  path,
  onCancel,
  onComplete,
}: {
  strategy: typeof LoginStrategies[number]["key"];
  path: string[];
  onCancel?: () => void;
  onComplete?: (userId: string) => void;
}) {
  const conn = useConnection();
  // uh assume the strategy is a message strategy idk.
  const strat = LoginStrategies.find((s) => s.key === strategy);
  if (!conn) throw new Error("ConnectionContext missing");
  if (!strat) throw new Error("Failed to look up this strategy");
  const { schema } = strat;
  const [address, setAddress] = useState<undefined | string>(undefined);
  const [token, setToken] = useState<undefined | string>(undefined);

  if (address) {
    return (
      <>
        <Title title={`Enter the code we sent to ${address}`} />
        <JSONSchemaForm
          id="auth-login-code"
          key="auth-login-code"
          schema={CodeSchema}
          saveLabel="Log In"
          onCancel={() => {
            setToken("");
            setAddress(undefined);
          }}
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
              },
            ).catch((e) => {
              setToken("");
              throw e;
            });
            if (!session) {
              setToken("");
              throw new Error("Failed to authenticate.");
            }
            setSession(conn.key, {
              authPath: path,
              userLabel: address,
              sessionId: session.sessionId,
              userId: session.userId,
              sessionToken: session.sessionToken,
            });
            showToast(`Logged in.`);
            onComplete?.(session.userId);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Title title={strat.title} />
      <JSONSchemaForm
        id="authCode"
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
const UsernamePasswordSchema: ZSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    username: { type: "string" },
    password: { type: "string", inputType: "password" },
  },
  propertyTitles: {
    username: "Username",
    password: "Password",
  },
  required: ["username", "password"],
} as const;

const InitialLoginFormValue = {
  username: "",
  password: "",
} as const;

function UsernamePasswordLoginForm({
  path,
  onCancel,
  onComplete,
}: {
  path: string[];
  onCancel?: () => void;
  onComplete?: (userId: string) => void;
}) {
  const conn = useConnection();
  if (!conn) throw new Error("ConnectionContext missing");

  return (
    <>
      <JSONSchemaForm
        id="usernamePasswordLogin"
        schema={UsernamePasswordSchema}
        saveLabel="Log In"
        value={InitialLoginFormValue}
        onSubmit={async (formValues) => {
          const session = await postZAction(
            conn,
            [...path, "createSessionWithPassword"],
            {
              userId: formValues.username,
              password: formValues.password,
            },
          ).catch((e) => {
            throw e;
          });
          if (!session) {
            throw new Error("Failed to authenticate.");
          }
          setSession(conn.key, {
            authPath: path,
            userLabel: formValues.username,
            sessionId: session.sessionId,
            userId: session.userId,
            sessionToken: session.sessionToken,
          });
          showToast(`Logged in.`);
          onComplete?.(session.userId);
        }}
        schemaStore={EmptySchemaStore}
        onCancel={onCancel}
      />
    </>
  );
}

function StrategySelectForm({
  onSelectedStrategy,
}: {
  onSelectedStrategy: (strat: typeof LoginStrategies[number]["key"]) => void;
}) {
  return (
    <VStack>
      <Title title="Log In / Register with:" />
      {LoginStrategies.map((l) => (
        <Button
          key={l.key}
          title={l.label}
          left={(p) => (l.icon ? <Icon {...p} name={l.icon} /> : null)}
          onPress={() => {
            onSelectedStrategy(l.key);
          }}
        />
      ))}
    </VStack>
  );
}

export function LoginForm({
  path,
  authMeta,
  onComplete,
}: {
  path: string[];
  authMeta: any;
  onComplete?: (userId: string) => void;
}) {
  const [selectedStrategy, setSelectedStrategy] = useState<
    null | typeof LoginStrategies[number]["key"]
  >(null);
  return (
    <>
      {!selectedStrategy && (
        <StrategySelectForm onSelectedStrategy={setSelectedStrategy} />
      )}
      {selectedStrategy === "Username" ? (
        <UsernamePasswordLoginForm
          path={path}
          onCancel={() => {
            setSelectedStrategy(null);
          }}
          onComplete={onComplete}
        />
      ) : (
        selectedStrategy && (
          <LoginStrategyForm
            strategy={selectedStrategy}
            path={path}
            onCancel={() => {
              setSelectedStrategy(null);
            }}
            onComplete={onComplete}
          />
        )
      )}
    </>
  );
}

export function LogoutButton({
  connection,
  session,
  onComplete,
}: {
  connection: Connection;
  session: SavedSession;
  onComplete?: () => void;
}) {
  const [readyForForceLogout, setReadyForForceLogout] = useState(false);
  return (
    <>
      {readyForForceLogout ? (
        <AsyncButton
          danger
          left={(props) => <Icon {...props} name="sign-out" />}
          onPress={async () => {
            await forceLocalLogout(connection);
            onComplete?.();
          }}
          title="Force Log Out (delete session)"
        />
      ) : (
        <AsyncButton
          left={<Icon name="sign-out" />}
          onPress={async () => {
            try {
              await logout(connection, session);
              onComplete?.();
            } catch (e) {
              setReadyForForceLogout(true);
              throw e;
            }
          }}
          title="Log Out"
        />
      )}
    </>
  );
}
