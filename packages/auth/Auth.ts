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

export const AuthenticatorDataSchema = {
  type: "object",
  properties: {
    authenticatorId: { type: "string" },
    userId: { type: "string" },
    strategyKey: { type: "string" },
    strategyName: { type: "string" },
    creationTime: { type: "integer" },
  },
  required: [
    "authenticatorId",
    "userId",
    "strategyKey",
    "strategyName",
    "creationTime",
  ],
  additionalProperties: false,
} as const;

const LogoutPayloadSchema = {
  type: "object",
  properties: {
    userId: { type: "string" },
    sessionId: { type: "string" },
  },
  required: ["userId", "sessionId"],
  additionalProperties: false,
} as const;

const LogoutAllPayloadSchema = {
  type: "object",
  properties: {
    userId: { type: "string" },
    sessionId: { type: "string" },
    sessionToken: { type: "string" },
  },
  required: ["userId", "sessionId", "sessionToken"],
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

export type AuthenticationFileData = FromSchema<typeof AuthenticatorDataSchema>;

const UserDataSchema = {
  type: "object",
  properties: {
    authenticatorIds: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: ["authenticatorIds"],
  additionalProperties: false,
} as const;

export type UserData = FromSchema<typeof UserDataSchema>;

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

  const authenticationFiles = createSystemFiles(
    join(files.z.Path.value, "authentications")
  );

  const usersFiles = createSystemFiles(join(files.z.Path.value, "users"));
  await usersFiles.z.MakeDir.call({
    path: "",
  });
  function getZLoggedInUser(userId: string, session: StoredSession) {
    return {
      setUsername: createZAction(
        UsernameSchema,
        NullSchema,
        async (newUserId: Username) => {
          if (newUserId === userId) return null;

          const userData: UserData = await usersFiles.z.ReadJSON.call({
            path: join(userId, "user.json"),
          });
          const { authenticatorIds } = userData;

          await Promise.all(
            authenticatorIds.map(async (authenticatorId) => {
              const authenticator = await authenticationFiles.z.ReadJSON.call({
                path: `${authenticatorId}/authenticator.json`,
              });
              await authenticationFiles.z.WriteJSON.call({
                path: `${authenticatorId}/authenticator.json`,
                value: { ...authenticator, userId: authenticatorId },
              });
            })
          );

          await usersFiles.z.Move.call({
            from: userId,
            to: newUserId,
          });

          await Promise.all(
            authenticatorIds.map(async (authenticatorId) => {
              const authenticator = await authenticationFiles.z.ReadJSON.call({
                path: `${authenticatorId}/authenticator.json`,
              });
              await authenticationFiles.z.WriteJSON.call({
                path: `${authenticatorId}/authenticator.json`,
                value: { ...authenticator, userId: newUserId },
              });
            })
          );
          return null;
        }
      ),
    };
  }

  async function getValidatedSession(
    userId: string,
    authPassword: string
  ): Promise<StoredSession> {
    ensureNoPathEscape(userId);
    ensureNoPathEscape(authPassword);
    const [sessionId, sessionToken] = authPassword.split(".");
    const sessionData =
      userId &&
      sessionId &&
      (await files.z.ReadJSON.call({
        path: join("users", userId, "sessions", `session-${sessionId}.json`),
      }));
    if (!sessionData)
      throw new UnauthorizedError(
        "Unauthorized",
        "Provide a valid session in the Authentication header.",
        {}
      );
    const session = validateWithSchema(StoredSessionSchema, sessionData);
    if (!session || sessionToken !== session.token) {
      throw new UnauthorizedError(
        "Unauthorized",
        "Provide a valid session in the Authentication header.",
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
        async ({ userId, sessionId }) => {
          ensureNoPathEscape(userId);
          ensureNoPathEscape(sessionId);
          const sessionIdOnly = sessionId.split(".")[0];
          await files.z.DeleteFile.call({
            path: join(
              "users",
              userId,
              "sessions",
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
        async ({ sessionToken, sessionId, userId }) => {
          const session = await getValidatedSession(
            userId,
            `${sessionId}.${sessionToken}`
          );
          const sessionFiles = (
            await files.z.ReadDir.call({
              path: join("users", userId, "sessions"),
            })
          ).filter(
            (fileName: string) => !!fileName.match(/^session-(.*)\.json$/)
          );
          await Promise.all(
            sessionFiles.map(async (fileName: string) => {
              await files.z.DeleteFile.call({
                path: join("users", userId, "sessions", fileName),
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
          const strategyAuthentication = await strategy.authorize(
            payload.payload,
            strategyFiles
          );

          if (strategyAuthentication) {
            const { strategyKey } = strategyAuthentication;
            const authenticatorId = sha256SumHex(
              `${strategyName}-${strategyKey}`
            );
            const authenticatorJsonPath = join(
              authenticatorId,
              `authenticator.json`
            );
            const prevAuthentication: AuthenticationFileData | undefined =
              await authenticationFiles.z.ReadJSON.call({
                path: authenticatorJsonPath,
              });
            let authentication: AuthenticationFileData =
              prevAuthentication ||
              (() => {
                return {
                  creationTime: Date.now(),
                  authenticatorId,
                  strategyKey,
                  strategyName,
                  userId: authenticatorId,
                };
              })();

            // eventually mutate the authenticator here?

            if (prevAuthentication !== authentication) {
              await authenticationFiles.z.MakeDir.call({
                path: authenticatorId,
              });
              await authenticationFiles.z.WriteJSON.call({
                path: authenticatorJsonPath,
                value: authentication,
              });
            }
            console.log("CREATING SESSION authenticator", authentication);
            const { userId } = authentication;
            const userDataPath = join(userId, "user.json");

            const prevUserData: UserData | undefined =
              await authenticationFiles.z.ReadJSON.call({
                path: userDataPath,
              });

            const userData =
              prevUserData ||
              (() => ({
                authenticatorIds: [authenticatorId],
              }))();
            if (userData !== prevUserData) {
              await usersFiles.z.MakeDir.call({
                path: userId,
              });
              await usersFiles.z.MakeDir.call({
                path: join(userId, "sessions"),
              });
              await usersFiles.z.WriteJSON.call({
                path: userDataPath,
                value: userData,
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
            await usersFiles.z.WriteJSON.call({
              path: join(userId, "sessions", `session-${sessionId}.json`),
              value: session,
            });
            return {
              sessionId,
              sessionToken,
              userId,
            };
          }
          return null;
        }
      ),

      user: createZAuthContainer(
        async (userId: string, authPassword: string) => {
          const session = await getValidatedSession(userId, authPassword);

          const loggedInUser = getZLoggedInUser(userId, session);
          return createZContainer(getUserZeds(loggedInUser));
        }
      ),
    },
    AuthContainerContractMeta
  );
}
