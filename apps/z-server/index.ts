import { join } from "path";
import { startZedServer } from "@zerve/node";

import {
  createZAction,
  createZContainer,
  createZGettable,
  NullSchema,
  NumberSchema,
} from "@zerve/core";
import {
  createAuth,
  createEmailAuthStrategy,
  createSMSAuthStrategy,
  createTestAuthStrategy,
} from "@zerve/auth";
import { createCoreData } from "@zerve/data";
import { createGeneralStore } from "@zerve/store";
import { createSystemFiles } from "@zerve/system-files";
import { createZMessageSMS } from "@zerve/message-sms-twilio";
import { createZMessageEmail } from "@zerve/message-email-sendgrid";
import { createSystemCommands } from "@zerve/system-commands";

const port = process.env.PORT ? Number(process.env.PORT) : 3888;

const homeDir = process.env.HOME;
const defaultZDataDir = `${homeDir}/.zerve`;

const dataDir =
  process.env.ZERVE_DATA_DIR ||
  (process.env.NODE_ENV === "dev"
    ? join(process.cwd(), "dev-data")
    : defaultZDataDir);

const secretsFile =
  process.env.ZERVE_SECRETS_JSON || join(process.cwd(), "../../secrets.json");

export async function startApp() {
  console.log("Starting Data Dir", dataDir);
  const Data = await createCoreData(dataDir);

  const InternalRootFiles = createSystemFiles("/");
  const ledgerCacheFiles = createSystemFiles(join(dataDir, "LedgerStateCache"));
  const secrets = await InternalRootFiles.z.ReadJSON.call({
    path: secretsFile,
  });
  function requireSecret(secretKey: string): string {
    const secret = secrets[secretKey];
    if (typeof secret === "string") return secret;
    throw new Error(
      `Failed to require secret string "${secretKey}" from secrets json`
    );
  }

  const SMS = createZMessageSMS({
    twilioAccountSid: requireSecret("TwilioAccountSid"),
    twilioKeySid: requireSecret("TwilioKeySid"),
    twilioKeySecret: requireSecret("TwilioKeySecret"),
    fromNumber: requireSecret("TwilioFromNumber"),
  });

  const Email = createZMessageEmail({
    sendgridKey: requireSecret("SendgridKey"),
    fromEmail: `Zerve Admin <admin@zerve.app>`,
  });

  const Store = await createGeneralStore(
    Data,
    createSystemFiles(join(dataDir, "GenStoreCache")),
    "GenStore"
  );

  const AuthFiles = createSystemFiles(join(dataDir, "Auth"));

  // const zRoot = createZContainer({
  //   Auth: await createAuth(
  //     {
  //       Email: await createEmailAuthStrategy(Email),
  //       Phone: await createSMSAuthStrategy(SMS),
  //       // Test: createTestAuthStrategy("Test0"),
  //     },
  //     AuthFiles,
  //     (user) => {
  //       return {
  //         ...user,
  //         Store,
  //       };
  //     }
  //   ),
  // });

  const zGetString = createZGettable(
    {
      type: "string",
    } as const,
    async (params: null) => {
      return "Hello";
    }
  );

  const zAction = createZAction(
    NumberSchema,
    NullSchema,
    async (value: number) => {
      console.log("doing the thing. your number is: ", value);
      return null;
    }
  );

  const zRoot = createZContainer({
    zGetString,
    zAction,
  });

  await startZedServer(port, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
