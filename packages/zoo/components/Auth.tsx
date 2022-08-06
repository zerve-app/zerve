import { useConnection } from "@zerve/client/Connection";
import { postZAction } from "@zerve/client/ServerCalls";
import {
  EmailSchema,
  EmptySchemaStore,
  PhoneSchema,
  ZSchema,
} from "@zerve/core";
import { Button, Icon, InfoRow, showToast, VStack } from "@zerve/zen";
import { useState } from "react";
import { setSession } from "../app/ConnectionStorage";
import { JSONSchemaForm } from "./JSONSchemaForm";

const LoginStrategies = [
  {
    icon: "mobile-phone",
    label: "Phone",
    key: "Phone",
    schema: PhoneSchema,
  },
  {
    icon: "envelope",
    label: "Email",
    key: "Email",
    schema: EmailSchema,
  },
  {
    icon: "user",
    label: "Username + Password",
    key: "Username",
    schema: {
      title: "Password",
      type: "string",
      minLength: 6,
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
  onComplete,
}: {
  strategy: typeof LoginStrategies[number]["key"];
  path: string[];
  onCancel?: () => void;
  onComplete?: () => void;
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
        <InfoRow label={strat.label} value={address} />
        <JSONSchemaForm
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
              }
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
            onComplete?.();
          }}
        />
      </>
    );
  }

  return (
    <>
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
}: {
  path: string[];
  onCancel?: () => void;
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
            }
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
        }}
        schemaStore={EmptySchemaStore}
        onCancel={onCancel}
      />
    </>
  );
}

export function LoginForm({
  path,
  authMeta,
  onComplete,
}: {
  path: string[];
  authMeta: any;
  onComplete: () => void;
}) {
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
      {selectedStrategy === "Username" ? (
        <UsernamePasswordLoginForm
          path={path}
          onCancel={() => {
            setSelectedStrategy(null);
          }}
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
    </VStack>
  );
}
