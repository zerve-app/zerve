import {
  AnySchema,
  createZAction,
  createZAuthContainer,
  createZContainer,
  createZStatic,
  NullSchema,
} from "@zerve/core";
import { SystemFilesModule } from "@zerve/system-files";
import { AuthStrategy } from "./AuthStrategy";

export async function createAuth<
  Strategies extends Record<string, AuthStrategy<any, any>>
>(strategies: Strategies, files: SystemFilesModule) {
  await files.z.MakeDir.call({ path: "" });
  // files.z.
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
    Object.entries(strategies).map(([strategyKey, strategy]) => {
      return [strategyKey, file];
    })
  );
  return createZContainer({
    createSession: createZAction(
      createSessionPayloadSchema,
      NullSchema,
      async (payload) => {
        const strategy = strategies[payload.strategy];
        if (!strategy) {
          throw new Error(`Strategy ${payload.strategy} not available.`);
        }
        const s = await strategy.authorize(payload.payload);
        console.log("HELLO", s, Object.keys(strategies));
        return null;
      }
    ),
    user: createZAuthContainer(async (userId: string, userKey: string) => {
      console.log("lol getting user api..", userId, userKey);

      return createZContainer({
        userId: createZStatic(userId),
        setUsername: createZAction(
          { type: "string" } as const,
          NullSchema,
          async () => {
            return null;
          }
        ),
      });
    }),
  });
}
