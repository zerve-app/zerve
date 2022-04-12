import { createZAction } from "@zerve/core";
import axios from "axios";

export const PhoneNumberSchema = {
  type: "string",
  title: "Phone Number",
  description: "Where to send the text",
  pattern: "^[0-9]{11,15}$",
  minLength: 11,
  maxLength: 15,
} as const;

export type ZMessageSMS = ReturnType<typeof createZMessageSMS>;

export function createZMessageSMS(config: {
  twilioAccountSid: string;
  twilioKeySid: string;
  twilioKeySecret: string;
  fromNumber: string;
}) {
  return createZAction(
    {
      type: "object",
      properties: {
        message: { type: "string" },
        toNumber: PhoneNumberSchema,
      },
      required: ["message", "toNumber"],
      additionalProperties: false,
    } as const,
    { type: "object", additionalProperties: false } as const,
    async ({ message, toNumber }) => {
      const data = new URLSearchParams({
        Body: message,
        From: config.fromNumber,
        To: toNumber,
      });

      const resp = await axios(
        `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`,
        {
          method: "post",
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${config.twilioKeySid}:${config.twilioKeySecret}`
            ).toString("base64")}`,
          },
          data,
        }
      );
      if (resp.status >= 300) {
        console.error("Failed SMS send:", resp.data);
        throw new Error("SMS Send Failure");
      }
      return {};
    }
  );
}
