import { AuthStrategy } from "./AuthStrategy";
import { ZMessageSMS } from "@zerve/message-sms-twilio";
import { createGenericMessageAuthStrategy } from "./AuthMessageStrategy";
import { FromSchema } from "@zerve/core";

const PhoneNumberSchema = {
  name: "Phone Number",
  placeholder: "12223334444",
  type: "string",
} as const;

export async function createSMSAuthStrategy(
  sms: ZMessageSMS
): Promise<AuthStrategy> {
  return createGenericMessageAuthStrategy(
    PhoneNumberSchema,
    async (code: string, address: FromSchema<typeof PhoneNumberSchema>) => {
      await sms.call({
        message: `Your Auth Code is: ${code}`,
        toNumber: address,
      });
    }
  );
}
