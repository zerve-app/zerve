import { join } from "path";
import { startZedServer } from "@zerve/node";

import {
  createZAction,
  createZContainer,
  createZGettable,
  createZGroup,
  createZStatic,
  NullSchema,
  NumberSchema,
  AnyZed,
  StringSchema,
  createZGettableGroup,
  GenericError,
  RequestError,
  NotFoundError,
  ChildrenListOptions,
} from "@zerve/core";
import { mkdirp, pathExists, readdir } from "fs-extra";
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

  const memoryStores: Record<string, Record<string, GeneralStoreModule>> = {};
  async function getMemoryStore(
    userId: string,
    storeId: string
  ): Promise<GeneralStoreModule> {
    const alreadyInMemoryStore = memoryStores[userId]?.[storeId];
    if (alreadyInMemoryStore) return alreadyInMemoryStore;
    if (!(await doesUserStoreExist(userId, storeId)))
      throw new NotFoundError(
        "NotFound",
        `The ${userId}/${storeId} store does not exist`,
        { userId, storeId }
      );
    const StoreData = await createCoreData(
      join(getMemoryStoreDir(userId, storeId), `Data`)
    );
    const userMemoryStores =
      memoryStores[userId] || (memoryStores[userId] = {});
    const newMemoryStore = await createGeneralStore(
      StoreData,
      createSystemFiles(join(getMemoryStoreDir(userId, storeId), `StoreCache`)),
      `Store`
    );
    userMemoryStores[storeId] = newMemoryStore;
    return newMemoryStore;
  }

  function getUserDir(userId: string): string {
    return join(dataDir, "userData", userId);
  }

  function getMemoryStoreDir(userId: string, storeId: string): string {
    return join(getUserDir(userId), "stores", storeId);
  }

  async function getUserZeds(user, { userId }): Record<string, AnyZed> {
    const CreateStore = createZAction(
      StringSchema,
      NullSchema,
      async (storeId: string) => {
        if (await doesUserStoreExist(userId, storeId))
          throw new RequestError(
            "AlreadyExists",
            `The "${storeId}" store already exists.`,
            { storeId }
          );
        const newStorePath = getMemoryStoreDir(userId, storeId);
        await mkdirp(newStorePath);
        return null;
      }
    );
    const Stores = createZGettableGroup(
      async (storeId: string) => {
        return await getMemoryStore(userId, storeId);
      },
      async (getOptions: ChildrenListOptions) => {
        const userStorePath = join(getUserDir(userId), "stores");
        let children = [];
        try {
          children = await readdir(userStorePath);
          children = children.filter((v) => v !== ".DS_Store");
        } catch (e) {
          if (e.code !== "ENOENT") throw e;
        }
        return { children, more: false, cursor: "" };
      }
    );

    return {
      ...user,
      CreateStore,
      Stores,
    };
  }
  async function doesUserStoreExist(userId: string, storeId: string) {
    const newStorePath = getMemoryStoreDir(userId, storeId);
    return await pathExists(newStorePath);
  }

  const zRoot = createZContainer({
    Store: createZGroup(async (userId: string) => {
      return createZGroup(async (storeId: string) => {
        const store = await getMemoryStore(userId, storeId);
        return store.z.State;
      });
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
        if (memoryStores[prevUserId]) {
          const userMemoryStores = memoryStores[prevUserId];
          delete memoryStores[prevUserId];
          memoryStores[userId] = userMemoryStores;
        }
      },
      getUserZeds,
    }),
  });

  await startZedServer(port, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
