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
import { pbkdf2 } from "crypto";

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
    authenticatorId: { oneOf: [{ type: "string" }, NullSchema] },
    startTime: { type: "number" },
    strategyKey: { oneOf: [{ type: "string" }, NullSchema] },
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
    passwordDigest: { type: "string" },
    passwordSalt: { type: "string" },
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

export const PasswordSchema = {
  title: "Password",
  type: "string",
  minLength: 6,
} as const;

const SetPasswordSchema = {
  type: "object",
  properties: {
    newPassword: PasswordSchema,
    previousPassword: PasswordSchema,
  },
  required: ["newPassword"],
  additionalProperties: false,
} as const;

const LoginWithPasswordSchema = {
  type: "object",
  properties: {
    userId: UsernameSchema,
    password: PasswordSchema,
  },
  required: ["userId", "password"],
  additionalProperties: false,
} as const;

const SessionSchema = {
  type: "object",
  properties: {
    userId: UsernameSchema,
    sessionId: { type: "string" },
    sessionToken: { type: "string" },
  },
  required: ["userId", "sessionId", "sessionToken"],
  additionalProperties: false,
} as const;

const MaybeSessionSchema = {
  oneOf: [NullSchema, SessionSchema],
} as const;

function getSetUsernameAction(
  usersFiles: SystemFilesModule,
  authenticationFiles: SystemFilesModule,
  userId: string,
  handleUserIdChange?: (prevUserId: string, userId: string) => Promise<void>
) {
  return createZAction(
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

      if (handleUserIdChange) await handleUserIdChange(userId, newUserId);
      return null;
    }
  );
}

async function digestPassword(pw: string, salt: string): Promise<string> {
  return await new Promise<string>((resolve, reject) =>
    pbkdf2(pw, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    })
  );
}

function getSetPasswordAction(
  usersFiles: SystemFilesModule,
  authenticationFiles: SystemFilesModule,
  userId: string
) {
  return createZAction(
    SetPasswordSchema,
    NullSchema,
    async ({ newPassword, previousPassword }) => {
      const userDataPath = join(userId, "user.json");

      const userData: UserData = await usersFiles.z.ReadJSON.call({
        path: userDataPath,
      });

      const passwordSalt = await new Promise<string>((resolve, reject) =>
        randomBytes(128, (err, randomBuffer) => {
          if (err) reject(err);
          else resolve(randomBuffer.toString("hex"));
        })
      );

      const passwordDigest = await digestPassword(newPassword, passwordSalt);

      await usersFiles.z.WriteJSON.call({
        path: userDataPath,
        value: {
          ...userData,
          passwordDigest,
          passwordSalt,
        },
      });

      return null;
    }
  );
}

export async function createAuth<
  Strategies extends Record<string, AuthStrategy<any, any>>,
  UserZeds extends Record<string, AnyZed>,
  UserAdminZeds extends Record<string, AnyZed>
>({
  strategies,
  files,
  getUserZeds,
  handleUserIdChange,
}: {
  strategies: Strategies;
  files: SystemFilesModule;
  getUserZeds: (user: UserAdminZeds, userInfo: { userId: string }) => UserZeds;
  handleUserIdChange?: (prevUserId: string, userId: string) => Promise<void>;
}) {
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

  function getZLoggedInUser(
    userId: string,
    session: StoredSession
  ): UserAdminZeds {
    return {
      setUsername: getSetUsernameAction(
        usersFiles,
        authenticationFiles,
        userId,
        handleUserIdChange
      ),
      setPassword: getSetPasswordAction(
        usersFiles,
        authenticationFiles,
        userId
      ),
    };
  }

  async function createUserSession(
    usersFiles: SystemFilesModule,
    authenticatorId: string | null,
    strategyKey: string | null,
    strategyName: string,
    userId: string
  ) {
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
      createSessionWithPassword: createZAction(
        LoginWithPasswordSchema,
        MaybeSessionSchema,
        async ({ userId, password }) => {
          const userDataPath = join(userId, "user.json");

          const userData: UserData = await usersFiles.z.ReadJSON.call({
            path: userDataPath,
          });

          if (!userData) throw new Error("Invalid Auth Attempt");

          const { passwordDigest, passwordSalt } = userData;

          if (!passwordDigest || !passwordSalt)
            throw new Error("Invalid Auth Attempt");

          const testPasswordDigest = await digestPassword(
            password,
            passwordSalt
          );

          if (testPasswordDigest !== passwordDigest)
            throw new Error("Invalid Auth Attempt");

          return await createUserSession(
            usersFiles,
            null,
            null,
            "$password",
            userId
          );
        }
      ),
      createSession: createZAction(
        createSessionPayloadSchema,
        MaybeSessionSchema,
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
            return await createUserSession(
              usersFiles,
              authenticatorId,
              strategyKey,
              strategyName,
              userId
            );
          }
          return null;
        }
      ),

      user: createZAuthContainer(
        async (userId: string, authPassword: string) => {
          const session = await getValidatedSession(userId, authPassword);

          const loggedInUser = getZLoggedInUser(userId, session);
          return createZContainer(await getUserZeds(loggedInUser, { userId }));
        }
      ),
    },
    AuthContainerContractMeta
  );
}
