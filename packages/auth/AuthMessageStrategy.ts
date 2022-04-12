import { FromSchema, JSONSchema } from "@zerve/core";
import { AuthStrategy } from "./AuthStrategy";

export function createGenericMessageAuthStrategy<
  AddressSchema extends JSONSchema
>(
  addressSchema: AddressSchema,
  handleMessageSend: (
    code: string,
    address: FromSchema<AddressSchema>
  ) => Promise<void>
) {
  return {
    authorizeSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        address: addressSchema,
        token: { type: ["null", "string"] },
      },
      required: ["address"],
    },
    authorize: async (payload) => {
      console.log("STRAGEGY AUTHORIZE", payload);
      return null;
    },
  };
}
