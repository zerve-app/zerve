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
import {
  CoreData,
  CoreStore,
  CoreTypes,
  SystemFiles,
  Ledger,
  CoreChain,
  MessageSMS,
  MessageEmail,
  SystemFetch,
  SystemSSH,
} from "@zerve/modules";
import SystemCommands from "@zerve/modules/SystemCommands/SystemCommands";
import { createZChainState } from "@zerve/modules/CoreChain/CoreChain";

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

function zTypeRef(typeName: string) {
  return { $ref: `https://zerve.app/.z/Types/State/${typeName}` };
}

const CoreStoreSchema = {
  type: "object",
  properties: {
    protocols: {
      type: "array",
      // todo, introduce new synthetic type here which allows the protocols to be a list of blocks, not inline data
      items: zTypeRef("Protocol"),
    },
  },
  required: ["protocols"],
  additionalProperties: false,
} as const;

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

  const Types = await CoreTypes.createZTypesStore(
    Data,
    SystemFiles.createSystemFiles(join(dataDir, "TypeStateCache"))
  );

  const Store = await CoreStore.createGeneralStore(
    Data,
    Types,
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
    Types,
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
