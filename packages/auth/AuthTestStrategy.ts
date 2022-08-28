import { AuthStrategy } from "./AuthStrategy";
import { createGenericMessageAuthStrategy } from "./AuthMessageStrategy";
import { NullSchema } from "@zerve/zed";

export function createTestAuthStrategy(
  tag: string,
): AuthStrategy<typeof NullSchema, {}> {
  return {
    authorizeSchema: NullSchema,
    authorize: async (payload: null) => {
      return {
        authTime: Date.now(),
        strategyKey: "asdf",
      };
    },
    getDetails: async () => {
      return {};
    },
  };
}
