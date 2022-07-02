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

const AuthMessageStrategyDefaultConfig = {
  // time user has to input the code
  authTimeoutMs: 90 * 60 * 1000,
  // time until user is allowed to re-request via this message
  authResetMs: 30 * 60 * 1000,
};
export function createGenericMessageAuthStrategy<
  AddressSchema extends JSONSchema,
  AuthDetails
>(
  addressSchema: AddressSchema,
  handleMessageSend: (
    token: string,
    address: FromSchema<AddressSchema>
  ) => Promise<void>,
  configInput?: {
    authTimeoutMs?: number;
    authResetMs?: number;
    validateAddress?: (address: FromSchema<AddressSchema>) => void;
  }
) {
  type Address = FromSchema<AddressSchema>;

  type AuthenticationDetails = {
    address: Address;
  };

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
      const { address } = payload;
      const validateAddress = configInput?.validateAddress;
      if (validateAddress) validateAddress(address);
      const addressKey = createHash("sha256")
        .update(stringify(address), "utf8")
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
          if (token !== payload.token) {
            // verify the user is providing the correct secret token according to our saved authRequest
            console.log("Requst token does not match");
            throw new Error("Invalid Auth Attempt");
          }
          if (now - config.authTimeoutMs > requestTime) {
            // ensure this validation is happening fast enough, within the configurable authTimeoutMs
            console.log("Requst timeout has already been reached");
            throw new Error("Invalid Auth Attempt");
          }
          await strategyFiles.z.WriteJSON.call({
            path: addressFileSubpath,
            value: {
              ...addressFile,
              authRequest: null,
            } as AddressFileData,
          });

          return { strategyKey: addressKey, authTime: Date.now(), address };
        } else {
          if (now - config.authResetMs < requestTime) {
            // another message has been sent within the "reset" time, which should be lower than the timeout, so we are actually in a good state.
            // return (null - happy case), also waste some time to pretend that maybe we did actually send an email
            await new Promise((resolve) =>
              setTimeout(resolve, 2000 + Math.floor(Math.random() * 2000))
            );
            return null;
          } else {
            // even though we have a pending authRequest, enough time has passed according to resetTime for us to send a new message.
            // to send a new message we simply wipe out the previous authRequest so a new one can be created below
            authRequest = null;
          }
        }
      }

      if (!authRequest) {
        // at this point we need to create a new authRequest by creating a secret token and sending it to the user via their "address"
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
      // saving the strategy address file
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
  } as AuthStrategy<typeof authorizeSchema, AuthDetails, AuthenticationDetails>;
}
