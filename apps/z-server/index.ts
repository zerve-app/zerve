import { join } from "path";
import { startZedServer } from "@zerve/node";

import { createZContainer } from "@zerve/core";
import {
  createAuth,
  createEmailAuthStrategy,
  createSMSAuthStrategy,
} from "@zerve/auth";
import { createCoreData } from "@zerve/data";
import { createGeneralStore } from "@zerve/store";
import { createSystemFiles } from "@zerve/system-files";
import SystemFetch from "@zerve/system-fetch";
import { createSystemSSH } from "@zerve/system-ssh";
import { ChainLedgerCalculator } from "@zerve/ledger";
import { createZMessageSMS } from "@zerve/message-sms-twilio";
import { createZMessageEmail } from "@zerve/message-email-sendgrid";
import { createSystemCommands } from "@zerve/system-commands";
import { createZChainState } from "@zerve/chain";

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
  const InternalRootFiles = createSystemFiles("/");
  console.log("Starting Data Dir", dataDir);
  const Data = await createCoreData(dataDir);

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

  const TestLedger = await createZChainState(
    Data,
    ledgerCacheFiles,
    "MyTestLedger",
    ChainLedgerCalculator
  );

  const Store = await createGeneralStore(
    Data,
    createSystemFiles(join(dataDir, "GenStoreCache")),
    "GenStore"
  );

  const InternalCommands = createSystemCommands();

  const Admin = createZContainer({
    Data,
    Fetch: SystemFetch.Fetch,
    RootFiles: InternalRootFiles,
    Commands: InternalCommands,
    SSH: createSystemSSH(InternalCommands),
    SMS,
    Email,
  });

  const zRoot = createZContainer({
    Auth: await createAuth(
      {
        Email: await createEmailAuthStrategy(Email),
        Phone: await createSMSAuthStrategy(SMS),
      },
      createSystemFiles(join(dataDir, "Auth"))
    ),
    Store,
    TestLedger,
    Admin,
  });

  // const c = zRoot.z.Admin.z.Commands.z.command

  await startZedServer(port, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
