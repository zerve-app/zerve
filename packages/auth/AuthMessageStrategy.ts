import { FromSchema, JSONSchema } from "@zerve/core";
import { SystemFilesModule } from "@zerve/system-files";
import stringify from "json-stable-stringify";
import { AuthStrategy } from "./AuthStrategy";
import { createHash } from "crypto";

function getToken(length = 6) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

type AddressFileData = {
  authRequest?: null | {
    requestTime: number;
    token: string;
  };
};

type AuthMessageStrategyConfig = {
  authTimeoutMs: number;
  authResetMs: number;
};
const AuthMessageStrategyDefaultConfig = {
  // time user has to input the code
  authTimeoutMs: 90 * 60 * 1000,
  // time until user is allowed to re-request via this message
  authResetMs: 30 * 60 * 1000,
};
export function createGenericMessageAuthStrategy<
  AddressSchema extends JSONSchema
>(
  addressSchema: AddressSchema,
  handleMessageSend: (
    token: string,
    address: FromSchema<AddressSchema>
  ) => Promise<void>,
  configInput?: Partial<AuthMessageStrategyConfig>
) {
  const config = {
    ...AuthMessageStrategyDefaultConfig,
    ...(configInput || {}),
  };
  type AuthorizePayload = {
    token: string | null;
    address: FromSchema<AddressSchema>;
  };
  const authorizeSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      address: addressSchema,
      token: { type: ["null", "string"] },
    },
    required: ["address"],
  } as const;
  return {
    authorizeSchema,
    authorize: async (
      payload: AuthorizePayload,
      strategyFiles: SystemFilesModule
    ) => {
      const addressKey = createHash("sha256")
        .update(stringify(payload.address), "utf8")
        .digest()
        .toString("hex");
      const addressFileSubpath = `${addressKey}.json`;
      const addressFile: AddressFileData = (await strategyFiles.z.ReadJSON.call(
        {
          path: addressFileSubpath,
        }
      )) || {
        address: payload.address,
        addressKey,
      };
      let authRequest: AddressFileData["authRequest"] = addressFile.authRequest;
      if (authRequest) {
        const { requestTime, token } = authRequest;
        const now = Date.now();

        if (payload.token) {
          if (now - config.authTimeoutMs > requestTime) {
            console.log("Requst timeout has already been reached");
            throw new Error("Invalid Auth Attempt");
          }
          if (token !== payload.token) {
            console.log("Requst token does not match");
            throw new Error("Invalid Auth Attempt");
          }
          await strategyFiles.z.WriteJSON.call({
            path: addressFileSubpath,
            value: {
              ...addressFile,
              authRequest: null,
            } as AddressFileData,
          });
          return { strategyKey: addressKey };
        } else {
          console.log(Math.floor((now - requestTime) / 1000));
          if (now - config.authResetMs < requestTime) {
            console.log("Reset time  token does not match");

            throw new Error("Invalid Auth Attempt");
          }
          authRequest = null;
        }
        config.authTimeoutMs;
      }
      if (!authRequest) {
        if (payload.token) {
          console.log(
            "Cannot provide a token when there is no pending auth request"
          );
          throw new Error("Invalid Auth Attempt");
        }
        const token = getToken();
        authRequest = {
          token,
          requestTime: Date.now(),
        };
        await handleMessageSend(token, payload.address);
      }
      await strategyFiles.z.WriteJSON.call({
        path: addressFileSubpath,
        value: {
          ...addressFile,
          authRequest,
        } as AddressFileData,
      });
      return null;
    },
    getDetails: async (
      strategyFiles: SystemFilesModule,
      addressKey: string
    ) => {
      const details = await strategyFiles.z.ReadJSON.call({
        path: `${addressKey}.json`,
      });
      return details;
    },
  } as AuthStrategy<typeof authorizeSchema>;
}
