import { createZAction, RequestError } from "@zerve/core";

import sgMail from "@sendgrid/mail";

let hasSetupSG = false;

export type ZMessageEmail = ReturnType<typeof createZMessageEmail>;

export function createZMessageEmail(config: {
  sendgridKey: string;
  fromEmail: string;
}) {
  if (hasSetupSG) throw new Error("Sendgrid API is a singleton, sorry.");
  sgMail.setApiKey(config.sendgridKey);
  hasSetupSG = true;

  return createZAction(
    {
      type: "object",
      title: "SendEmailActionRequest",
      description: "Use SendGrid to send an email.",
      submitLabel: "Send",
      properties: {
        message: { title: "Message Text", type: "string" },
        subject: { title: "Subject", type: "string" },
        toEmail: {
          title: "To Email",
          type: "string",
          placeholder: "my@email.example",
          format: "email",
          tags: ["email"],
        },
      },
      required: ["message", "subject", "toEmail"],
      additionalProperties: false,
    } as const,
    {
      type: "object",
      title: "SendEmailActionResponse",
      additionalProperties: false,
    } as const,
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
