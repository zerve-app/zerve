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

  const [zAuth, { createEntity, getEntity, writeEntity }] = await createAuth({
    strategies: {
      Email: await createEmailAuthStrategy(Email),
      Phone: await createSMSAuthStrategy(SMS),
    },
    files: AuthFiles,
    handleUserIdChange: async (
      prevUserId: string,
      userId: string,
      entityData: any
    ) => {
      console.log("handleUserIdChange", entityData);
      try {
        await DataDirFiles.z.Move.call({
          from: join("userData", prevUserId),
          to: join("userData", userId),
        });
      } catch (e) {
        if (e.code === "ENOENT") return;
        throw e;
      }
      await Promise.all(
        (entityData?.affiliatedOrgs || []).map(
          async (affiliatedOrgId: string) => {
            const entityData = await getEntity(affiliatedOrgId);
            const newEntity = {
              ...entityData,
            };
            if (entityData.ownerUserId === prevUserId) {
              newEntity.ownerUserId = userId;
            }
            await writeEntity(affiliatedOrgId, newEntity);
          }
        )
      );
      if (memoryStores[prevUserId]) {
        const userMemoryStores = memoryStores[prevUserId];
        delete memoryStores[prevUserId];
        memoryStores[userId] = userMemoryStores;
      }
    },
    getUserZeds,
  });

  const memoryStores: Record<string, Record<string, GeneralStoreModule>> = {};
  async function getMemoryStore(
    entityId: string,
    storeId: string
  ): Promise<GeneralStoreModule> {
    const alreadyInMemoryStore = memoryStores[entityId]?.[storeId];
    if (alreadyInMemoryStore) return alreadyInMemoryStore;
    if (!(await doesUserStoreExist(entityId, storeId)))
      throw new NotFoundError(
        "NotFound",
        `The ${entityId}/${storeId} store does not exist`,
        { entityId, storeId }
      );
    const StoreData = await createCoreData(
      join(getEntityStoreDir(entityId, storeId), `Data`)
    );
    const userMemoryStores =
      memoryStores[entityId] || (memoryStores[entityId] = {});
    const newMemoryStore = await createGeneralStore(
      StoreData,
      createSystemFiles(
        join(getEntityStoreDir(entityId, storeId), `StoreCache`)
      ),
      `Store`
    );
    userMemoryStores[storeId] = newMemoryStore;
    return newMemoryStore;
  }

  function getUserDir(userId: string): string {
    return join(dataDir, "userData", userId);
  }

  function getEntityStoreDir(userId: string, storeId: string): string {
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
        const newStorePath = getEntityStoreDir(userId, storeId);
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
    const CreateOrg = createZAction(
      StringSchema,
      NullSchema,
      async (orgId: string) => {
        const userEntityData = await getEntity(userId);
        await createEntity(orgId, {
          ownerUserId: userId,
        });
        await writeEntity(userId, {
          ...userEntityData,
          affiliatedOrgs: [...(userEntityData.affiliatedOrgs || []), orgId],
        });

        return null;
      }
    );
    return {
      ...user,
      CreateStore,
      CreateOrg,
      Stores,
    };
  }
  async function doesUserStoreExist(userId: string, storeId: string) {
    const newStorePath = getEntityStoreDir(userId, storeId);
    return await pathExists(newStorePath);
  }

  const zRoot = createZContainer({
    Store: createZGroup(async (userId: string) => {
      return createZGroup(async (storeId: string) => {
        const store = await getMemoryStore(userId, storeId);
        return store.z.State;
      });
    }),

    Auth: zAuth,
  });

  await startZedServer(port, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
