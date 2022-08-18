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
  RequestError,
  createZGettable,
  StringSchema,
  BooleanSchema,
} from "@zerve/core";
import { randomBytes, createHash } from "crypto";
import {
  ensureNoPathEscape,
  MakeDir,
  joinPath,
  ReadJSON,
  WriteJSON,
  DeleteFile,
  Move,
  ReadDir,
  Exists,
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

export const AuthProfileSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    userId: StringSchema,
    hasPassword: BooleanSchema,
    addresses: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          strategyName: StringSchema,
          address: StringSchema,
        },
        required: ["strategyName", "address"],
      },
    },
  },
  required: ["userId", "hasPassword"],
} as const;

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
    profile: {
      type: "object",
      properties: {
        displayName: StringSchema,
      },
      required: [],
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
  usersFilesPath: string,
  authenticationFilesPath: string,
  userId: string,
  handleUserIdChange?: (
    prevUserId: string,
    userId: string,
    entityData: any,
  ) => Promise<void>,
) {
  return createZAction(
    UsernameSchema,
    NullSchema,
    async (newUserId: Username) => {
      if (newUserId === userId) return null;

      const entityData: UserData = await ReadJSON.call(
        joinPath(usersFilesPath, userId, "entity.json"),
      );

      const { authenticatorIds } = entityData;

      await Promise.all(
        authenticatorIds.map(async (authenticatorId: string) => {
          const authenticator = await ReadJSON.call(
            joinPath(
              authenticationFilesPath,
              authenticatorId,
              "authenticator.json",
            ),
          );
          await WriteJSON.call({
            path: joinPath(
              authenticationFilesPath,
              authenticatorId,
              "authenticator.json",
            ),
            value: { ...authenticator, userId: authenticatorId },
          });
        }),
      );

      await Move.call({
        from: joinPath(usersFilesPath, userId),
        to: joinPath(usersFilesPath, newUserId),
      });

      await Promise.all(
        authenticatorIds.map(async (authenticatorId: string) => {
          const authenticator = await ReadJSON.call(
            joinPath(
              authenticationFilesPath,
              authenticatorId,
              "authenticator.json",
            ),
          );
          await WriteJSON.call({
            path: joinPath(
              authenticationFilesPath,
              authenticatorId,
              "authenticator.json",
            ),
            value: { ...authenticator, userId: newUserId },
          });
        }),
      );

      if (handleUserIdChange)
        await handleUserIdChange(userId, newUserId, entityData);
      return null;
    },
  );
}

async function digestPassword(pw: string, salt: string): Promise<string> {
  return await new Promise<string>((resolve, reject) =>
    pbkdf2(pw, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    }),
  );
}

function getSetPasswordAction(
  usersFilesPath: string,
  authenticationFilesPath: string,
  userId: string,
) {
  return createZAction(
    SetPasswordSchema,
    NullSchema,
    async ({ newPassword, previousPassword }) => {
      const userDataPath = joinPath(usersFilesPath, userId, "entity.json");

      const userData: UserData = await ReadJSON.call(userDataPath);

      const passwordSalt = await new Promise<string>((resolve, reject) =>
        randomBytes(128, (err, randomBuffer) => {
          if (err) reject(err);
          else resolve(randomBuffer.toString("hex"));
        }),
      );

      const passwordDigest = await digestPassword(newPassword, passwordSalt);

      await WriteJSON.call({
        path: userDataPath,
        value: {
          ...userData,
          passwordDigest,
          passwordSalt,
        },
      });

      return null;
    },
  );
}

export async function createAuth<
  Strategies extends Record<string, AuthStrategy<any, any>>,
  UserZeds extends Record<string, AnyZed>,
  UserAdminZeds extends Record<string, AnyZed>,
>({
  strategies,
  authFilesPath,
  getUserZeds,
  handleUserIdChange,
}: {
  strategies: Strategies;
  authFilesPath: string;
  getUserZeds: (user: UserAdminZeds, userInfo: { userId: string }) => UserZeds;
  handleUserIdChange?: (prevUserId: string, userId: string) => Promise<void>;
}) {
  const zContainerMeta = {
    ...AuthContainerContractMeta,
    strategies: Object.keys(strategies),
  };
  await MakeDir.call(authFilesPath);

  async function getDefaultUserId(uniqueSeed: string): Promise<string> {
    const userId = `${uniqueSeed.slice(0, 3)}-${uniqueSeed.slice(
      4,
      7,
    )}-${uniqueSeed.slice(8, 11)}`;
    if (await Exists.call(joinPath(authFilesPath, "entities", userId))) {
      throw new Error("Whoops, please try again.");
    }
    return userId;
  }

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
  const strategiesFilesPath = Object.fromEntries(
    await Promise.all(
      Object.entries(strategies).map(async ([strategyKey, strategy]) => {
        const strategyFilesPath = joinPath(
          authFilesPath,
          "strategies",
          strategyKey,
        );
        await MakeDir.call(strategyFilesPath);
        return [strategyKey, strategyFilesPath];
      }),
    ),
  );

  function getProfileGetter(userId: string) {
    return createZGettable(AuthProfileSchema, async () => {
      const userDataPath = joinPath(usersFilesPath, userId, "entity.json");
      const userData: UserData = await ReadJSON.call(userDataPath);
      const addresses = await Promise.all(
        userData.authenticatorIds.map(async (authenticatorId) => {
          const authenticator = await ReadJSON.call(
            joinPath(
              authenticationFilesPath,
              authenticatorId,
              "authenticator.json",
            ),
          );
          const { strategyName } = authenticator;
          const authStrategyRecord = await ReadJSON.call(
            joinPath(
              authFilesPath,
              "strategies",
              authenticator.strategyName,
              `${authenticator.strategyKey}.json`,
            ),
          );
          const { address } = authStrategyRecord;
          return { strategyName, address };
        }),
      );
      return {
        userId,
        addresses,
        hasPassword: !!userData.passwordDigest && !!userData.passwordSalt,
      };
    });
  }

  const authenticationFilesPath = joinPath(authFilesPath, "authentications");

  const usersFilesPath = joinPath(authFilesPath, "entities");
  await MakeDir.call(usersFilesPath);

  function getZLoggedInUser(
    userId: string,
    session: StoredSession,
  ): UserAdminZeds {
    return {
      profile: getProfileGetter(userId),
      setUsername: getSetUsernameAction(
        usersFilesPath,
        authenticationFilesPath,
        userId,
        handleUserIdChange,
      ),
      setPassword: getSetPasswordAction(
        usersFilesPath,
        authenticationFilesPath,
        userId,
      ),
    };
  }

  async function createUserSession(
    usersFilesPath: string,
    authenticatorId: string | null,
    strategyKey: string | null,
    strategyName: string,
    userId: string,
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
    await WriteJSON.call({
      path: joinPath(
        usersFilesPath,
        userId,
        "sessions",
        `session-${sessionId}.json`,
      ),
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
    authPassword: string,
  ): Promise<StoredSession> {
    ensureNoPathEscape(userId);
    ensureNoPathEscape(authPassword);
    const [sessionId, sessionToken] = authPassword.split(".");
    const sessionData =
      userId &&
      sessionId &&
      (await ReadJSON.call(
        joinPath(
          authFilesPath,
          "entities",
          userId,
          "sessions",
          `session-${sessionId}.json`,
        ),
      ));
    if (!sessionData)
      throw new UnauthorizedError(
        "Unauthorized",
        "Provide a valid session in the Authentication header.",
        {},
      );
    const session = validateWithSchema(StoredSessionSchema, sessionData);
    if (!session || sessionToken !== session.token) {
      throw new UnauthorizedError(
        "Unauthorized",
        "Provide a valid session in the Authentication header.",
        {},
      );
    }
    return session;
  }

  const zAuth = createZMetaContainer(
    {
      // anybody can call this action! all they need is the sessionId to log out.
      logout: createZAction(
        LogoutPayloadSchema,
        NullSchema,
        async ({ userId, sessionId }) => {
          ensureNoPathEscape(userId);
          ensureNoPathEscape(sessionId);
          const sessionIdOnly = sessionId.split(".")[0];
          await DeleteFile.call(
            joinPath(
              authFilesPath,
              "entities",
              userId,
              "sessions",
              `session-${sessionIdOnly}.json`,
            ),
          );
          return null;
        },
      ),

      // ANYbody can call this action, it is not protected. So we have to check for the session that is passed through the body, with getValidatedSession!
      logoutAll: createZAction(
        LogoutAllPayloadSchema,
        NullSchema,
        async ({ sessionToken, sessionId, userId }) => {
          const session = await getValidatedSession(
            userId,
            `${sessionId}.${sessionToken}`,
          );
          const sessionFiles = (
            await ReadDir.call(joinPath("entities", userId, "sessions"))
          ).filter(
            (fileName: string) => !!fileName.match(/^session-(.*)\.json$/),
          );
          await Promise.all(
            sessionFiles.map(async (fileName: string) => {
              await DeleteFile.call(
                joinPath("entities", userId, "sessions", fileName),
              );
            }),
          );
          return null;
        },
      ),
      createSessionWithPassword: createZAction(
        LoginWithPasswordSchema,
        MaybeSessionSchema,
        async ({ userId, password }) => {
          const userDataPath = joinPath(usersFilesPath, userId, "entity.json");

          const userData: UserData = await ReadJSON.call(userDataPath);

          if (!userData) throw new Error("Invalid Auth Attempt");

          const { passwordDigest, passwordSalt } = userData;

          if (!passwordDigest || !passwordSalt)
            throw new Error("Invalid Auth Attempt");

          const testPasswordDigest = await digestPassword(
            password,
            passwordSalt,
          );

          if (testPasswordDigest !== passwordDigest)
            throw new Error("Invalid Auth Attempt");

          return await createUserSession(
            usersFilesPath,
            null,
            null,
            "$password",
            userId,
          );
        },
      ),
      createSession: createZAction(
        createSessionPayloadSchema,
        MaybeSessionSchema,
        async (payload) => {
          const strategyName: string = payload.strategy;
          const strategy = strategies[strategyName];
          const strategyFilesPath = strategiesFilesPath[strategyName];
          if (!strategy || !strategyFilesPath) {
            throw new Error(`Strategy ${strategyName} not available.`);
          }
          const strategyAuthentication = await strategy.authorize(
            payload.payload,
            strategyFilesPath,
          );

          if (strategyAuthentication) {
            const { strategyKey } = strategyAuthentication;
            const authenticatorId = sha256SumHex(
              `${strategyName}-${strategyKey}`,
            );
            const authenticatorJsonPath = joinPath(
              authenticationFilesPath,
              authenticatorId,
              `authenticator.json`,
            );
            const prevAuthentication: AuthenticationFileData | undefined =
              await ReadJSON.call(authenticatorJsonPath);

            let authentication: AuthenticationFileData =
              prevAuthentication ||
              (await (async () => {
                return {
                  creationTime: Date.now(),
                  authenticatorId,
                  strategyKey,
                  strategyName,
                  userId: await getDefaultUserId(authenticatorId),
                };
              })());

            // eventually mutate the authenticator here?

            if (prevAuthentication !== authentication) {
              await MakeDir.call(
                joinPath(authenticationFilesPath, authenticatorId),
              );
              await WriteJSON.call({
                path: authenticatorJsonPath,
                value: authentication,
              });
            }
            const { userId } = authentication;
            const userDataPath = joinPath(
              usersFilesPath,
              userId,
              "entity.json",
            );

            const prevUserData: UserData | undefined = await ReadJSON.call(
              userDataPath,
            );

            const userData =
              prevUserData ||
              (() => ({
                authenticatorIds: [authenticatorId],
              }))();
            if (userData !== prevUserData) {
              await MakeDir.call(joinPath(usersFilesPath, userId));
              await MakeDir.call(joinPath(usersFilesPath, userId, "sessions"));
              await WriteJSON.call({
                path: userDataPath,
                value: userData,
              });
            }
            return await createUserSession(
              usersFilesPath,
              authenticatorId,
              strategyKey,
              strategyName,
              userId,
            );
          }
          return null;
        },
      ),

      user: createZAuthContainer(
        async (userId: string, authPassword: string) => {
          const session = await getValidatedSession(userId, authPassword);

          const loggedInUser = getZLoggedInUser(userId, session);
          return createZContainer(await getUserZeds(loggedInUser, { userId }));
        },
      ),
    },
    zContainerMeta,
  );

  async function createEntity(
    entityId: string,
    entityData: any,
  ): Promise<void> {
    if (await Exists.call(joinPath(usersFilesPath, entityId))) {
      throw new RequestError(
        "AlreadyExists",
        `An entity named "${entityId}" already exists!`,
        { entityId },
      );
    }
    await MakeDir.call(joinPath(usersFilesPath, entityId));
    await WriteJSON.call({
      path: joinPath(usersFilesPath, entityId, "entity.json"),
      value: entityData,
    });
  }
  async function getEntity(entityId: string): Promise<any> {
    const entityValue = await ReadJSON.call(
      joinPath(usersFilesPath, entityId, "entity.json"),
    );
    return entityValue;
  }
  async function writeEntity(entityId: string, entityData: any): Promise<void> {
    await WriteJSON.call({
      path: joinPath(usersFilesPath, entityId, "entity.json"),
      value: entityData,
    });
  }
  return [zAuth, { createEntity, getEntity, writeEntity }];
}
