import { AuthStrategy } from "./AuthStrategy";
import { ZMessageSMS } from "@zerve/message-sms-twilio";
import { createGenericMessageAuthStrategy } from "./AuthMessageStrategy";
import { FromSchema, PhoneSchema } from "@zerve/core";

export async function createSMSAuthStrategy(
  sms: ZMessageSMS
): Promise<AuthStrategy> {
  return createGenericMessageAuthStrategy(
    PhoneSchema,
    async (code: string, address: FromSchema<typeof PhoneSchema>) => {
      await sms.call({
        message: `Your Auth Code is: ${code}`,
        toNumber: address,
      });
    }
  );
}
