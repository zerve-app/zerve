import {
  AnyZed,
  createZAction,
  createZAuthContainer,
  createZContainer,
  FromSchema,
  NullSchema,
  UnauthorizedError,
  createZMetaContainer,
  validateWithSchema,
} from "@zerve/core";
import { join } from "path";
import { randomBytes, createHash } from "crypto";
import {
  createSystemFiles,
  ensureNoPathEscape,
  SystemFilesModule,
} from "@zerve/system-files";
import { AuthStrategy } from "./AuthStrategy";

const AuthContainerContractMeta = { zContract: "Auth" } as const;

function sha256SumHex(value: string) {
  const hash = createHash("sha256")
    .update(value, "utf8")
    .digest()
    .toString("hex");
  return hash;
}

export const UserInfoSchema = {
  type: "object",
  properties: {
    authenticatorId: { type: "string" },
    strategyKey: { type: "string" },
    strategyName: { type: "string" },
    creationTime: { type: "integer" },
  },
  required: ["authenticatorId", "strategyKey", "strategyName", "creationTime"],
  additionalProperties: false,
} as const;

const LogoutPayloadSchema = {
  type: "object",
  properties: {
    authenticatorId: { type: "string" },
    sessionId: { type: "string" },
  },
  required: ["authenticatorId", "sessionId"],
  additionalProperties: false,
} as const;

const LogoutAllPayloadSchema = {
  type: "object",
  properties: {
    authenticatorId: { type: "string" },
    sessionToken: { type: "string" },
  },
  required: ["authenticatorId", "sessionToken"],
  additionalProperties: false,
} as const;

const StoredSessionSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    token: { type: "string" },
    authenticatorId: { type: "string" },
    startTime: { type: "number" },
    strategyKey: { type: "string" },
    strategyName: { type: "string" },
  },
  required: [
    "id",
    "token",
    "authenticatorId",
    "startTime",
    "strategyKey",
    "strategyName",
  ],
  additionalProperties: false,
} as const;
type StoredSession = FromSchema<typeof StoredSessionSchema>;

export type AuthenticatorFileData = FromSchema<typeof UserInfoSchema>;

const UsernameSchema = {
  title: "Username",
  type: "string",
} as const;

export type Username = FromSchema<typeof UsernameSchema>;

export async function createAuth<
  Strategies extends Record<string, AuthStrategy<any, any>>,
  UserZeds extends Record<string, AnyZed>,
  UserAdminZeds extends Record<string, AnyZed>
>(
  strategies: Strategies,
  files: SystemFilesModule,
  getUserZeds: (user: UserAdminZeds) => UserZeds = (u) => u
) {
  await files.z.MakeDir.call({ path: "" });

  const createSessionPayloadSchema = {
    oneOf: Object.entries(strategies).map(([strategyKey, strategy]) => {
      return {
        type: "object",
        properties: {
          strategy: { const: strategyKey },
          payload: strategy.authorizeSchema,
        },
        required: ["strategy", "payload"],
        additionalProperties: false,
      };
    }),
  };
  const strategiesFiles = Object.fromEntries(
    await Promise.all(
      Object.entries(strategies).map(async ([strategyKey, strategy]) => {
        const strategyFiles = createSystemFiles(
          join(files.z.Path.value, "strategies", strategyKey)
        );
        await strategyFiles.z.MakeDir.call({ path: "" });
        return [strategyKey, strategyFiles];
      })
    )
  );
  const strategyAuthorizationsFiles = Object.fromEntries(
    await Promise.all(
      Object.entries(strategies).map(async ([strategyKey, strategy]) => {
        const authorizationsFiles = createSystemFiles(
          join(files.z.Path.value, "authorizations", strategyKey)
        );
        await authorizationsFiles.z.MakeDir.call({ path: "" });
        return [strategyKey, authorizationsFiles];
      })
    )
  );

  function getZLoggedInUser(session: StoredSession) {
    return {
      setUsername: createZAction(
        UsernameSchema,
        NullSchema,
        async (username: Username) => {
          console.log("trying to change username!", username, session);
          return null;
        }
      ),
    };
  }

  async function getValidatedSession(
    authenticatorId: string,
    authPassword: string
  ): Promise<StoredSession> {
    ensureNoPathEscape(authenticatorId);
    ensureNoPathEscape(authPassword);
    const [sessionId, sessionToken] = authPassword.split(".");
    const sessionData =
      authenticatorId &&
      sessionId &&
      (await files.z.ReadJSON.call({
        path: join(
          // FIX ME FIX ME, session should be stored under the user
          "authorizations",
          authenticatorId,
          `session-${sessionId}.json`
        ),
      }));
    const session = validateWithSchema(StoredSessionSchema, sessionData);
    if (!session || sessionToken !== session.token) {
      throw new UnauthorizedError(
        "Unauthorized",
        "Provide a session in the Authentication header.",
        {}
      );
    }
    return session;
  }

  return createZMetaContainer(
    {
      // anybody can call this action! all they need is the sessionId to log out.
      logout: createZAction(
        LogoutPayloadSchema,
        NullSchema,
        async ({ authenticatorId, sessionId }) => {
          ensureNoPathEscape(authenticatorId);
          ensureNoPathEscape(sessionId);
          const sessionIdOnly = sessionId.split(".")[0];
          await files.z.DeleteFile.call({
            path: join(
              "authenticators",
              authenticatorId,
              `session-${sessionIdOnly}.json`
            ),
          });
          console.log("did log out");
          return null;
        }
      ),

      // ANYbody can call this action, it is not protected. So we have to check for the session that is passed through the body, with getValidatedSession!
      logoutAll: createZAction(
        LogoutAllPayloadSchema,
        NullSchema,
        async ({ authenticatorId, sessionToken }) => {
          const session = await getValidatedSession(
            authenticatorId,
            sessionToken
          );
          const sessionFiles = (
            await files.z.ReadDir.call({
              path: join("authenticators", authenticatorId),
            })
          ).filter(
            (fileName: string) => !!fileName.match(/^session-(.*)\.json$/)
          );
          await Promise.all(
            sessionFiles.map(async (fileName: string) => {
              await files.z.DeleteFile.call({
                path: join("authenticators", authenticatorId, fileName),
              });
            })
          );
          console.log("did log out all");
          return null;
        }
      ),
      createSession: createZAction(
        createSessionPayloadSchema,
        NullSchema,
        async (payload) => {
          const strategyName: string = payload.strategy;
          const strategy = strategies[strategyName];
          const strategyFiles = strategiesFiles[strategyName];
          if (!strategy || !strategyFiles) {
            throw new Error(`Strategy ${strategyName} not available.`);
          }
          const strategyAuthorization = await strategy.authorize(
            payload.payload,
            strategyFiles
          );
          if (strategyAuthorization) {
            const { strategyKey } = strategyAuthorization;
            const authenticatorId = sha256SumHex(
              `${strategyName}-${strategyKey}`
            );
            const authenticatorJsonPath = join(
              authenticatorId,
              `authenticator.json`
            );
            const authorizationsFiles =
              strategyAuthorizationsFiles[strategyName];
            if (!authorizationsFiles)
              throw new Error("Cannot find storage for " + strategyName);
            const prevUser: AuthenticatorFileData | undefined =
              await authorizationsFiles.z.ReadJSON.call({
                path: authenticatorJsonPath,
              });
            let user: AuthenticatorFileData =
              prevUser ||
              (() => {
                return {
                  creationTime: Date.now(),
                  authenticatorId,
                  strategyKey,
                  strategyName,
                };
              })();
            if (prevUser !== user) {
              await authorizationsFiles.z.MakeDir.call({
                path: authenticatorId,
              });
              await authorizationsFiles.z.WriteJSON.call({
                path: authenticatorJsonPath,
                value: user,
              });
            }

            const sessionId = randomBytes(60).toString("hex");
            const sessionToken = randomBytes(60).toString("hex");
            const session: StoredSession = {
              id: sessionId,
              token: sessionToken,
              authenticatorId,
              startTime: Date.now(),
              strategyKey,
              strategyName,
            };
            await files.z.WriteJSON.call({
              path: join(
                "authenticators",
                authenticatorId,
                `session-${sessionId}.json`
              ),
              value: session,
            });
            return {
              sessionId,
              sessionToken,
              authenticatorId,
            };
          }
          return null;
        }
      ),

      user: createZAuthContainer(
        async (authenticatorId: string, authPassword: string) => {
          const session = await getValidatedSession(
            authenticatorId,
            authPassword
          );

          const loggedInUser = getZLoggedInUser(session);
          return createZContainer(getUserZeds(loggedInUser));
        }
      ),
    },
    AuthContainerContractMeta
  );
}
