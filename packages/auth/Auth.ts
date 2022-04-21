import {
  AnyZed,
  createZAction,
  createZAuthContainer,
  createZContainer,
  FromSchema,
  NullSchema,
  UnauthorizedError,
  createZMetaContainer,
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

export type AuthenticatorFileData = FromSchema<typeof UserInfoSchema>;

export async function createAuth<
  Strategies extends Record<string, AuthStrategy<any, any>>,
  UserZeds extends Record<string, AnyZed>
>(
  strategies: Strategies,
  files: SystemFilesModule,
  getUserZeds: (sess: { authenticatorId: string }) => UserZeds = (u) => u
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

  async function getValidatedSession(
    authenticatorId: string,
    authPassword: string
  ) {
    ensureNoPathEscape(authenticatorId);
    ensureNoPathEscape(authPassword);
    const [sessionId, sessionToken] = authPassword.split(".");
    const session =
      authenticatorId &&
      sessionId &&
      (await files.z.ReadJSON.call({
        path: join("users", authenticatorId, `session-${sessionId}.json`),
      }));
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
      logout: createZAction(
        LogoutPayloadSchema,
        NullSchema,
        async ({ authenticatorId, sessionId }) => {
          ensureNoPathEscape(authenticatorId);
          ensureNoPathEscape(sessionId);
          const sessionIdOnly = sessionId.split(".")[0];
          await files.z.DeleteFile.call({
            path: join(
              "users",
              authenticatorId,
              `session-${sessionIdOnly}.json`
            ),
          });
          console.log("did log out");
          return null;
        }
      ),
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
              path: join("users", authenticatorId),
            })
          ).filter(
            (fileName: string) => !!fileName.match(/^session-(.*)\.json$/)
          );
          await Promise.all(
            sessionFiles.map(async (fileName: string) => {
              await files.z.DeleteFile.call({
                path: join("users", authenticatorId, fileName),
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
          const approvedSession = await strategy.authorize(
            payload.payload,
            strategyFiles
          );
          if (approvedSession) {
            const { strategyKey } = approvedSession;
            const authenticatorId = sha256SumHex(
              `${strategyName}-${strategyKey}`
            );
            const userJsonPath = join(
              "users",
              authenticatorId,
              `authenticator.json`
            );
            const prevUser: AuthenticatorFileData | undefined =
              await files.z.ReadJSON.call({ path: userJsonPath });
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
              await files.z.MakeDir.call({
                path: join("users", authenticatorId),
              });
              await files.z.WriteJSON.call({
                path: userJsonPath,
                value: user,
              });
            }

            const sessionId = randomBytes(60).toString("hex");
            const sessionToken = randomBytes(60).toString("hex");
            const session = {
              id: sessionId,
              token: sessionToken,
              authenticatorId,
              startTime: Date.now(),
              strategyKey,
              strategyName,
            };
            await files.z.WriteJSON.call({
              path: join("users", authenticatorId, `session-${sessionId}.json`),
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
          const publicSession = {
            authenticatorId: session.authenticatorId,
          };
          return createZContainer(getUserZeds(publicSession));
        }
      ),
    },
    AuthContainerContractMeta
  );
}
