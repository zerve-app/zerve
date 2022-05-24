import { join } from "path";
import { startZedServer } from "@zerve/node";

import {
  createZAction,
  createZContainer,
  createZGettable,
  createZGroup,
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
import { createGeneralStore, GeneralStoreModule } from "@zerve/store";
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
  const DataDirFiles = createSystemFiles(dataDir);

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

  const AuthFiles = createSystemFiles(join(dataDir, "Auth"));

  const stores: Record<string, GeneralStoreModule> = {};

  async function getUserStore(id: string): Promise<GeneralStoreModule> {
    if (stores[id]) return stores[id];
    stores[id] = await createGeneralStore(
      Data,
      createSystemFiles(join(dataDir, "userData", id, `StoreCache`)),
      `User_${id}_Store`
    );
    return stores[id];
  }

  const zRoot = createZContainer({
    CustomStore: await createGeneralStore(
      Data,
      createSystemFiles(join(dataDir, `CustomStore_StoreCache`)),
      `CustomStore_Store`
    ),

    StoreState: createZGroup(async (userId) => {
      const store = await getUserStore(userId);
      return store.z.State;
    }),

    Auth: await createAuth({
      strategies: {
        Email: await createEmailAuthStrategy(Email),
        Phone: await createSMSAuthStrategy(SMS),
      },
      files: AuthFiles,
      handleUserIdChange: async (prevUserId: string, userId: string) => {
        console.log("handleUserIdChange", prevUserId, userId);
        try {
          await DataDirFiles.z.Move.call({
            from: join("userData", prevUserId),
            to: join("userData", userId),
          });
        } catch (e) {
          if (e.code === "ENOENT") return;
          throw e;
        }
        try {
          await Data.z.Actions.z.MoveDoc.call({
            from: `User_${prevUserId}_Store`,
            to: `User_${userId}_Store`,
          });
        } catch (e) {
          if (e.code === "ENOENT") return;
          throw e;
        }
      },
      getUserZeds: async (user, { userId }) => {
        return {
          ...user,
          Store: await getUserStore(userId),
        };
      },
    }),
  });

  await startZedServer(port, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
