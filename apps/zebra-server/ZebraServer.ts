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
  ForbiddenError,
  RequestError,
  NotFoundError,
  ChildrenListOptions,
  BooleanSchema,
  HumanTextSchema,
  FromSchema,
  JSONSchema,
  StoreSettings,
  StoreSettingsSchema,
} from "@zerve/core";
import { mkdirp, pathExists, readdir } from "fs-extra";
import {
  createAuth,
  createEmailAuthStrategy,
  createSMSAuthStrategy,
} from "@zerve/auth";
import { createCoreData } from "@zerve/data";
import {
  Move,
  DeleteRecursive,
  WriteJSON,
  joinPath,
  ReadJSON,
} from "@zerve/system-files";
import { createGeneralStore, GeneralStoreModule } from "@zerve/store";
import { createZMessageSMS } from "@zerve/message-sms-twilio";
import { createZMessageEmail } from "@zerve/message-email-sendgrid";

const port = process.env.PORT ? Number(process.env.PORT) : 3888;

const homeDir = process.env.HOME;
const defaultZDataDir = `${homeDir}/.zerve`;

const dataDir =
  process.env.ZERVE_DATA_DIR ||
  (process.env.NODE_ENV === "dev"
    ? joinPath(process.cwd(), "dev-data")
    : defaultZDataDir);

const secretsFile =
  process.env.ZERVE_SECRETS_JSON ||
  joinPath(process.cwd(), "../../secrets.json");

type MemoryStore = { store: GeneralStoreModule; settings: StoreSettings };

export async function startApp() {
  console.log("Starting Data Dir", dataDir);

  const secrets = await ReadJSON.call(secretsFile);
  function requireSecret(secretKey: string): string {
    const secret = secrets[secretKey];
    if (typeof secret === "string") return secret;
    throw new Error(
      `Failed to require secret string "${secretKey}" from secrets json`,
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

  const [zAuth, { createEntity, getEntity, writeEntity }] = await createAuth({
    strategies: {
      Email: await createEmailAuthStrategy(Email),
      Phone: await createSMSAuthStrategy(SMS),
    },
    authFilesPath: joinPath(dataDir, "Auth"),
    handleUserIdChange: async (
      prevUserId: string,
      userId: string,
      entityData: any,
    ) => {
      try {
        await Move.call({
          from: joinPath(dataDir, "userData", prevUserId),
          to: joinPath(dataDir, "userData", userId),
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
          },
        ),
      );
      if (memoryStores[prevUserId]) {
        const userMemoryStores = memoryStores[prevUserId];
        delete memoryStores[prevUserId];
      }
    },
    getUserZeds,
  });

  const memoryStores: Record<string, Record<string, MemoryStore>> = {};
  async function getMemoryStore(
    entityId: string,
    storeId: string,
    providedSettings?: StoreSettings,
  ): Promise<MemoryStore> {
    const alreadyInMemoryStore = memoryStores[entityId]?.[storeId];
    if (
      alreadyInMemoryStore &&
      providedSettings &&
      alreadyInMemoryStore.settings === providedSettings
    )
      return alreadyInMemoryStore;
    if (!(await doesEntityStoreExist(entityId, storeId)))
      throw new NotFoundError(
        "NotFound",
        `The ${entityId}/${storeId} store does not exist`,
        { entityId, storeId },
      );
    const storePath = getEntityStoreDir(entityId, storeId);
    const StoreData = await createCoreData(joinPath(storePath, `Data`));
    const userMemoryStores =
      memoryStores[entityId] || (memoryStores[entityId] = {});
    const storeSettings: StoreSettings =
      providedSettings ||
      ((await ReadJSON.call(
        joinPath(storePath, "settings.json"),
      )) as StoreSettings) ||
      {};
    const enabledSchemas: Record<string, JSONSchema> = {};
    if (storeSettings?.enabledSchemas?.HumanText)
      enabledSchemas.HumanText = HumanTextSchema;
    const store = await createGeneralStore(
      StoreData,
      joinPath(getEntityStoreDir(entityId, storeId), `StoreCache`),
      `Store`,
      enabledSchemas,
    );
    const newMemoryStore = { store, settings: storeSettings };
    userMemoryStores[storeId] = newMemoryStore;
    return newMemoryStore;
  }
  async function writeStoreSettings(
    entityId: string,
    storeId: string,
    settings: StoreSettings,
  ) {
    const alreadyInMemoryStore = memoryStores[entityId]?.[storeId];
    const storePath = getEntityStoreDir(entityId, storeId);
    const settingsPath = joinPath(storePath, "settings.json");
    await WriteJSON.call({ path: settingsPath, value: settings });
    if (alreadyInMemoryStore) {
      // this will re-instansiate the store in memory with new settings
      getMemoryStore(entityId, storeId, settings);
      // its a bit unintuitive that getMemoryStore has side effects, sorry.
    }
  }

  function getUserDir(userId: string): string {
    return joinPath(dataDir, "userData", userId);
  }

  function getEntityStoreDir(userId: string, storeId: string): string {
    return joinPath(getUserDir(userId), "stores", storeId);
  }

  function getStoreGroup(entityId: string) {
    const Stores = createZGettableGroup(
      async (storeId: string) => {
        const memStore = await getMemoryStore(entityId, storeId);
        return memStore.store;
      },
      async (getOptions: ChildrenListOptions) => {
        const userStorePath = joinPath(getUserDir(entityId), "stores");
        let children = [];
        try {
          children = await readdir(userStorePath);
          children = children.filter((v) => v !== ".DS_Store");
        } catch (e) {
          if (e.code !== "ENOENT") throw e;
        }
        return { children, more: false, cursor: "" };
      },
    );
    const DestroyStore = createZAction(
      StringSchema,
      NullSchema,
      async (storeId) => {
        if (!doesEntityStoreExist(entityId, storeId)) {
          throw new Error("Store does not exist.");
        }
        await DeleteRecursive.call(getEntityStoreDir(entityId, storeId));
        if (memoryStores[entityId]?.[storeId]) {
          delete memoryStores[entityId]?.[storeId];
        }
        await new Promise((resolve) => setTimeout(resolve, 2000)); // lol
        return null;
      },
    );
    const MoveStore = createZAction(
      {
        type: "object",
        properties: { from: StringSchema, to: StringSchema },
        additionalProperties: false,
        required: ["from", "to"],
      },
      NullSchema,
      async ({ from, to }) => {
        if (memoryStores[entityId]?.[from]) {
          delete memoryStores[entityId]?.[from];
        }
        await Move.call({
          from: getEntityStoreDir(entityId, from),
          to: getEntityStoreDir(entityId, to),
        });
        // in case some race condition caused this to be created during the move process..
        if (memoryStores[entityId]?.[from]) {
          delete memoryStores[entityId]?.[from];
        }
        return null;
      },
    );
    const StoreSettings = createZGroup(async (storeId) =>
      createZGettable(StoreSettingsSchema, async () => {
        const memStore = await getMemoryStore(entityId, storeId);
        return memStore.settings;
      }),
    );
    const WriteStoreSettings = createZAction(
      {
        type: "object",
        additionalProperties: false,
        properties: {
          storeId: StringSchema,
          settings: StoreSettingsSchema,
        },
        required: ["storeId", "settings"],
      } as const,
      NullSchema,
      async ({
        settings,
        storeId,
      }: {
        settings: StoreSettings;
        storeId: string;
      }) => {
        writeStoreSettings(entityId, storeId, settings);
        return null;
      },
    );
    return {
      Stores,
      DestroyStore,
      MoveStore,
      StoreSettings,
      WriteStoreSettings,
    };
  }

  function getStoreCreatorAction(entityId: string) {
    return createZAction(StringSchema, NullSchema, async (storeId: string) => {
      if (await doesEntityStoreExist(entityId, storeId))
        throw new RequestError(
          "AlreadyExists",
          `The "${storeId}" store already exists.`,
          { storeId },
        );
      const storePath = getEntityStoreDir(entityId, storeId);
      await mkdirp(storePath);
      return null;
    });
  }

  function getOrgOwnerAbilities(userId: string, ownerId: string) {
    return {
      role: createZStatic("owner"),
      inviteMember: createZAction(() => {}),
    };
  }

  async function getUserZeds(
    user,
    { userId },
  ): Promise<Record<string, AnyZed>> {
    const CreateStore = getStoreCreatorAction(userId);
    const StoreGroup = getStoreGroup(userId);
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
      },
    );

    const Orgs = createZGettableGroup(
      async (orgId: string) => {
        const orgEntity = await getEntity(orgId);
        const isUserOwner = !!orgEntity && orgEntity.ownerUserId === userId;
        if (!isUserOwner)
          throw new ForbiddenError(
            "NotInOrg",
            `You do not have access to the "${orgId}" org.`,
            { orgId, userId },
          );
        return createZContainer({
          orgId: createZStatic(orgId),
          CreateStore: getStoreCreatorAction(orgId),
          ...getStoreGroup(orgId),
          Members: createZGettableGroup(
            async (memberId: string) => {
              return createZStatic({});
            },
            async (getOptions: ChildrenListOptions) => {
              return {
                children: orgEntity.members || [],
                cursor: "",
                more: false,
              };
            },
          ),
          role: createZStatic("member"),
          ...(isUserOwner ? getOrgOwnerAbilities(userId, orgId) : {}),
        });
      },
      async (getOptions: ChildrenListOptions) => {
        const userEntity = await getEntity(userId);
        const { affiliatedOrgs } = userEntity;
        return {
          children: affiliatedOrgs || [],
          more: false,
          cursor: "",
        };
      },
    );

    const OrgInvites = createZGettableGroup(
      async (orgId: string) => {
        return createZContainer({
          orgId: createZStatic(orgId),
          respond: createZAction(
            BooleanSchema,
            NullSchema,
            async (doesAccept: boolean) => {
              // ok respond to org invite ok
              return null;
            },
          ),
        });
      },
      async (getOptions: ChildrenListOptions) => {
        return {
          children: [],
          more: false,
          cursor: "",
        };
      },
    );
    return {
      ...user,
      CreateStore,
      CreateOrg,
      Orgs,
      OrgInvites,
      ...StoreGroup,
    };
  }
  async function doesEntityStoreExist(entityId: string, storeId: string) {
    const storePath = getEntityStoreDir(entityId, storeId);
    return await pathExists(storePath);
  }

  const zRoot = createZContainer({
    store: createZGroup(async (userId: string) => {
      return createZGroup(async (storeId: string) => {
        const memStore = await getMemoryStore(userId, storeId);
        return createZContainer({
          state: memStore.store.z.State,
        });
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
