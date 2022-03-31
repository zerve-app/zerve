import { join } from "path";
import { startZedServer } from "@zerve/node";

import {
  createZAction,
  createZGroup,
  createZGettable,
  createZStatic,
  createZContainer,
  ZGettable,
} from "@zerve/core";
import CoreData from "@zerve/data";
import CoreStore from "@zerve/store";
import CoreChain from "@zerve/chain";
import SystemFiles from "@zerve/system-files";
import SystemFetch from "@zerve/system-fetch";
import SystemSSH from "@zerve/system-ssh";
import Ledger from "@zerve/ledger";
import MessageSMS from "@zerve/message-sms-twilio";
import MessageEmail from "@zerve/message-email-sendgrid";
import SystemCommands from "@zerve/system-commands";
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
  const InternalRootFiles = SystemFiles.createSystemFiles("/");
  console.log("Starting Data Dir", dataDir);
  const Data = await CoreData.createCoreData(dataDir);

  const ledgerCacheFiles = SystemFiles.createSystemFiles(
    join(dataDir, "LedgerStateCache")
  );
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

  const SMS = MessageSMS.createZMessageSMS({
    twilioAccountSid: requireSecret("TwilioAccountSid"),
    twilioKeySid: requireSecret("TwilioKeySid"),
    twilioKeySecret: requireSecret("TwilioKeySecret"),
    fromNumber: requireSecret("TwilioFromNumber"),
  });

  const Email = MessageEmail.createZMessageEmail({
    sendgridKey: requireSecret("SendgridKey"),
    fromEmail: `Zerve Admin <admin@zerve.app>`,
  });

  const TestLedger = await CoreChain.createZChainState(
    Data,
    ledgerCacheFiles,
    "MyTestLedger",
    Ledger.ChainLedgerCalculator
  );

  const Store = await CoreStore.createGeneralStore(
    Data,
    SystemFiles.createSystemFiles(join(dataDir, "GenStoreCache")),
    "GenStore"
  );

  const InternalCommands = SystemCommands.createSystemCommands();

  const Admin = createZContainer({
    Data,
    Fetch: SystemFetch.Fetch,
    RootFiles: InternalRootFiles,
    Commands: InternalCommands,
    SSH: SystemSSH.createSystemSSH(InternalCommands),
    SMS,
    Email,
  });

  const zRoot = createZContainer({
    Store,
    TestLedger,
    Admin,
  });

  await startZedServer(port, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
