import { ZMessageEmail } from "@zerve/message-email-sendgrid";
import { createGenericMessageAuthStrategy } from "./AuthMessageStrategy";
import { ServerError, RequestError, EmailSchema } from "@zerve/zed";

const DEV = process.env.NODE_ENV === "dev";

type EmailAuthOptions = {
  emailAllowList?: null | string[];
  domainAllowList?: null | string[];
};

export async function createEmailAuthStrategy(
  email: ZMessageEmail,
  options?: EmailAuthOptions,
) {
  return createGenericMessageAuthStrategy(
    EmailSchema,
    async (code: string, address: string) => {
      DEV && console.log(`Sending AUTH EMAIL to ${address} with code ${code}`);
      try {
        await email.call({
          message: `Your code is ${code}`,
          subject: "Zerve Auth",
          toEmail: address,
        });
      } catch (e) {
        // allow email send failure in dev mode because console.log prints the code for the developer
        if (!DEV) throw e;
        console.error("Failed to acutally send verification email:");
        console.error(e);
      }
    },
    {
      validateAddress: (email) => {
        const { emailAllowList, domainAllowList } = options || {};
        if (emailAllowList) {
          const isFoundInAllowList = emailAllowList.indexOf(email) !== -1;
          if (!isFoundInAllowList)
            throw new RequestError(
              "EmailDisallowed",
              `"${email}" is not allowed.`,
            );
        }
        if (domainAllowList) {
          const emailDomain: null | string = email.match(/@(.*)$/)?.[1] || null;
          if (!emailDomain)
            throw new RequestError(
              "EmailDisallowed",
              `"${email}" is not allowed.`,
            );
          const isFoundInAllowList =
            domainAllowList.indexOf(emailDomain) !== -1;
          if (!isFoundInAllowList)
            throw new RequestError(
              "EmailDomainDisallowed",
              `"${emailDomain}" is not an allowed domain.`,
            );
        }
        return true;
      },
    },
  );
}
