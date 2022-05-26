import { AuthStrategy } from "./AuthStrategy";
import { ZMessageEmail } from "@zerve/message-email-sendgrid";
import { createGenericMessageAuthStrategy } from "./AuthMessageStrategy";

const EmailSchema = {
  title: "Email Address",
  type: "string",
  format: "email",
} as const;

type EmailAuthOptions = {
  emailAllowlist?: null | string[];
  domainAllowlist?: null | string[];
};

export async function createEmailAuthStrategy(
  email: ZMessageEmail,
  options?: EmailAuthOptions
): Promise<AuthStrategy> {
  return createGenericMessageAuthStrategy(
    EmailSchema,
    async (code: string, address: string) => {
      await email.call({
        message: `Your code is ${code}`,
        subject: "Zerve Auth",
        toEmail: address,
      });
    },
    {
      validateAddress: (email) => {
        if (!options) return true;
        const { emailAllowList, domainAllowlist } = options;
        if (emailAllowList) {
          const isFoundInAllowList = emailAllowList.indexOf(email) !== -1;
          return isFoundInAllowList;
        }
        if (domainAllowlist) {
          const emailDomain: null | string = email.match(/@(.*)$/)?.[1];
          if (!emailDomain) return false;
          const isFoundInAllowList =
            domainAllowlist.indexOf(emailDomain) !== -1;
          return isFoundInAllowList;
        }
        return true;
      },
    }
  );
}
