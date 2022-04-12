import { AuthStrategy } from "./AuthStrategy";
import { ZMessageEmail } from "@zerve/message-email-sendgrid";
import { createGenericMessageAuthStrategy } from "./AuthMessageStrategy";

const EmailSchema = {
  title: "Email Address",
  type: "string",
  format: "email",
} as const;

export async function createEmailAuthStrategy(
  email: ZMessageEmail
): Promise<AuthStrategy> {
  return createGenericMessageAuthStrategy(
    EmailSchema,
    async (code: string, address: string) => {
      await email.call({
        message: `Your code is ${code}`,
        subject: "Zerve Auth",
        toEmail: address,
      });
    }
  );
}
