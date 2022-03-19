import { createZAction, RequestError } from "@zerve/core";

import sgMail from "@sendgrid/mail";

let hasSetupSG = false;

function createZMessageEmail(config: {
  sendgridKey: string;
  fromEmail: string;
}) {
  if (hasSetupSG) throw new Error("Sendgrid API is a singleton, sorry.");
  sgMail.setApiKey(config.sendgridKey);
  hasSetupSG = true;

  return createZAction(
    {
      type: "object",
      properties: {
        message: { type: "string" },
        subject: { type: "string" },
        toEmail: { type: "string", format: "email" },
      },
      required: ["message", "subject", "toEmail"],
      additionalProperties: false,
    } as const,
    { type: "object", additionalProperties: false } as const,
    async ({ message, subject, toEmail }) => {
      try {
        await sgMail.send({
          to: toEmail,
          from: config.fromEmail,
          subject: subject,
          text: message,
          html: message,
        });
      } catch (e) {
        const sgError = (e as any)?.response?.body?.errors?.[0];
        if (sgError?.message === "Does not contain a valid address.") {
          throw new RequestError("ValidationError", `Validation Error`, [
            {
              instancePath: "/email",
              schemaPath: "/email",
              keyword: "email",
              params: {},
              message: "Email is invalid",
            },
          ]);
        } else throw new Error("EmailSend Error");
      }
      return {};
    }
  );
}

const MessageEmail = {
  createZMessageEmail,
};

export default MessageEmail;
