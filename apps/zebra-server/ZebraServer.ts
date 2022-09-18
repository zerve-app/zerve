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
  FromSchema,
  JSONSchema,
  StoreSettings,
  StoreSettingsSchema,
  IDSchema,
  zAnnotateCache,
  createZMetaContainer,
  ActionResponseSchema,
} from "@zerve/zed";
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
import { createStream as createRotatingWriteStream } from "rotating-file-stream";
import { HumanTextSchema } from "@zerve/react-native-content/Schema";

const port = process.env.PORT ? Number(process.env.PORT) : 3888;

const homeDir = process.env.HOME;
const defaultZDataDir = `${homeDir}/.zerve`;

const dataDir =
  process.env.ZERVE_DATA_DIR ||
  (process.env.NODE_ENV === "dev"
    ? joinPath(process.cwd(), "dev-data")
    : defaultZDataDir);

const loggingDir = joinPath(dataDir, "logs");

const secretsFile =
  process.env.ZERVE_SECRETS_JSON ||
  joinPath(process.cwd(), "../../secrets.json");

type MemoryStore = { store: GeneralStoreModule; settings: StoreSettings };

export async function startApp() {
  console.log("Starting Zebra with Data Dir", dataDir);

  let publicBuildInfo = null;
  try {
    publicBuildInfo = await ReadJSON.call(
      joinPath(process.cwd(), "../../build.json"),
    );
  } catch (e) {
    console.warn(
      "Public build data (build.json) not found in the project directory. It will be null",
    );
  }
  const myBuildId = publicBuildInfo?.buildId || "unknown";
  const logPath = joinPath(loggingDir, `${myBuildId}.log`);

  console.log("Starting build " + myBuildId);
  console.log("Writing logs to " + logPath);

  const logStream = createRotatingWriteStream(logPath, {
    size: "10M", // rotate every 10 MegaBytes written
    interval: "1d", // rotate daily
    compress: "gzip", // compress rotated files
  });

  function logEvent(name: string, event: any) {
    const time = Date.now();
    if (process.env.VERBOSE) {
      console.log(`${name} event (${time}): `, JSON.stringify(event, null, 2));
    }
    logStream.write(JSON.stringify({ name, time, event }));
    logStream.write("\n");
  }

  function logServerEvent(name: string, event: any) {
    let overriddenEvent = event;
    const { path, body } = event;
    if (!body) {
      logEvent(name, overriddenEvent);
      return;
    }
    // we MUST strip plaintext passwords to prevent them from appearing in the logs!
    // other than plaintext pw, all user data is already accessible for somebody who has read access on the dataDir
    // because we have a deep understanding of the Auth module and client UI, we know these are the only two situations where the user should provide plaintext pw to the server
    if (path === "/auth/createSessionWithPassword") {
      overriddenEvent = {
        ...event,
        body: { ...body, password: !!body.password },
      };
    }
    if (path === "/auth/user/setPassword") {
      overriddenEvent = {
        ...event,
        body: null,
      };
    }
    logEvent(name, overriddenEvent);
  }

  logEvent("WillStartServer", {
    port,
    dataDir,
    secretsFile, // this is just the path. we should avoid logging real secrets if possible
    logPath,
    publicBuildInfo,
  });

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
    fromEmail: process.env.FROM_EMAIL || `Zerve Admin <admin@zerve.app>`,
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
    userContainerMeta: {
      zIndex: ["index"],
    },
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
      {
        title: storeId,
        icon: "briefcase",
      },
    );
    const newMemoryStore = { store, settings: storeSettings };
    userMemoryStores[storeId] = newMemoryStore;
    return newMemoryStore;
  }

  function getUserDir(userId: string): string {
    return joinPath(dataDir, "userData", userId);
  }

  function getEntityStoreDir(userId: string, storeId: string): string {
    return joinPath(getUserDir(userId), "stores", storeId);
  }

  function getStoreGroup(entityId: string, contextPath: string[]) {
    const stores = createZGettableGroup(
      async (storeId: string) => {
        const memStore = await getMemoryStore(entityId, storeId);
        // avoid aggressive cache policy for private stores
        return zAnnotateCache(memStore.store, { isVolatile: true });
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
      {
        title: "Stores",
        icon: "folder-open",
        zStatic: {
          zContract: "ReferenceList",
          items: [
            {
              key: "create",
              name: "Create Store",
              icon: "plus-circle",
              path: [...contextPath, "createStore"],
            },
          ],
        },
      },
    );
    const destroyStore = createZAction(
      StringSchema,
      ActionResponseSchema,
      async (storeId) => {
        if (!doesEntityStoreExist(entityId, storeId)) {
          throw new Error("Store does not exist.");
        }
        await DeleteRecursive.call(getEntityStoreDir(entityId, storeId));
        if (memoryStores[entityId]?.[storeId]) {
          delete memoryStores[entityId]?.[storeId];
        }
        await new Promise((resolve) => setTimeout(resolve, 2000)); // lol
        return {
          zContract: "Response",
          redirect: {
            zContract: "Redirect",
            replace: true,
            path: [...contextPath, "stores"],
          },
          invalidate: {
            zContract: "Invalidate",
            paths: [[...contextPath, "stores"]],
          },
        };
      },
    );
    const moveStore = createZAction(
      {
        type: "object",
        properties: { from: IDSchema, to: IDSchema },
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
    const storeSettings = createZGroup(async (storeId) =>
      zAnnotateCache(
        createZGettable(StoreSettingsSchema, async () => {
          const memStore = await getMemoryStore(entityId, storeId);
          return memStore.settings;
        }),
        { isVolatile: true },
      ),
    );
    const writeStoreSettings = createZAction(
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
        const alreadyInMemoryStore = memoryStores[entityId]?.[storeId];
        const storePath = getEntityStoreDir(entityId, storeId);
        const settingsPath = joinPath(storePath, "settings.json");
        await WriteJSON.call({ path: settingsPath, value: settings });
        if (alreadyInMemoryStore) {
          // this will re-instansiate the store in memory with new settings
          await getMemoryStore(entityId, storeId, settings);
          // its a bit unintuitive that getMemoryStore has side effects, sorry.
        }
        return null;
      },
    );
    const createStore = createZAction(
      IDSchema,
      ActionResponseSchema,
      async (storeId: string) => {
        if (await doesEntityStoreExist(entityId, storeId))
          throw new RequestError(
            "AlreadyExists",
            `The "${storeId}" store already exists.`,
            { storeId },
          );
        const storePath = getEntityStoreDir(entityId, storeId);
        await mkdirp(storePath);
        return {
          zContract: "Response",
          redirect: {
            zContract: "Redirect",
            replace: true,
            path: [...contextPath, "stores", storeId],
          },
          invalidate: {
            zContract: "Invalidate",
            paths: [[...contextPath, "stores"]],
          },
        };
      },
      {
        title: "Create Store",
        icon: "plus-circle",
      },
    );
    return {
      stores,
      createStore,
      destroyStore,
      moveStore,
      storeSettings,
      writeStoreSettings,
    };
  }

  function getOrgOwnerAbilities(userId: string, ownerId: string) {
    return {
      role: createZStatic("owner"),
      // inviteMember: createZAction(() => {}),
    };
  }

  const authUserPath = ["auth", "user"];

  async function getUserZeds(
    user,
    { userId },
  ): Promise<Record<string, AnyZed>> {
    const storeGroup = getStoreGroup(userId, authUserPath);
    const createOrg = createZAction(
      StringSchema,
      ActionResponseSchema,
      async (orgId: string) => {
        const userEntityData = await getEntity(userId);
        await createEntity(orgId, {
          ownerUserId: userId,
        });
        await writeEntity(userId, {
          ...userEntityData,
          affiliatedOrgs: [...(userEntityData.affiliatedOrgs || []), orgId],
        });

        return {
          zContract: "Response",
          redirect: {
            zContract: "Redirect",
            replace: true,
            path: [...authUserPath, "orgs", orgId],
          },
          invalidate: {
            zContract: "Invalidate",
            paths: [[...authUserPath, "orgs"]],
          },
        };
      },
      {
        title: "Create Org",
        icon: "plus-circle",
      },
    );

    const orgs = createZGettableGroup(
      async (orgId: string) => {
        const orgEntity = await getEntity(orgId);
        const isUserOwner = !!orgEntity && orgEntity.ownerUserId === userId;
        if (!isUserOwner)
          throw new ForbiddenError(
            "NotInOrg",
            `You do not have access to the "${orgId}" org.`,
            { orgId, userId },
          );
        const orgPath = [...authUserPath, "orgs", orgId];
        return createZMetaContainer(
          {
            orgId: createZStatic(orgId),
            ...getStoreGroup(orgId, [...authUserPath, "orgs", orgId]),
            index: createZStatic({
              zContract: "ReferenceList",
              items: [
                {
                  key: "stores",
                  name: "Stores",
                  path: [...orgPath, "stores"],
                  icon: "folder-open",
                },
                {
                  key: "members",
                  name: "Members",
                  path: [...orgPath, "members"],
                  icon: "building",
                },
                {
                  key: "org-settings",
                  name: "Org Settings",
                  path: [...orgPath, "orgSettings"],
                  icon: "gear",
                },
              ],
            }),
            orgSettings: createZStatic({
              zContract: "ReferenceList",
              items: [],
            }),
            members: createZGettableGroup(
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
          },
          {
            title: orgId,
            icon: "building",
            zIndex: ["index"],
          },
        );
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
      {
        title: "Organizations",
        icon: "building",
        zStatic: {
          zContract: "ReferenceList",
          items: [
            {
              key: "create",
              name: "Create Org",
              icon: "plus-circle",
              path: [...authUserPath, "createOrg"],
            },
          ],
        },
      },
    );

    const orgInvites = createZGettableGroup(
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
      createOrg,
      orgs,
      orgInvites,
      index: createZStatic({
        zContract: "ReferenceList",
        items: [
          {
            key: "stores",
            name: "Personal Stores",
            path: ["auth", "user", "stores"],
            icon: "folder-open",
          },
          {
            key: "organizations",
            name: "Organizations",
            path: ["auth", "user", "orgs"],
            icon: "building",
          },
          {
            key: "user-settings",
            name: "Account Settings",
            path: ["auth", "user", "accountSettings"],
            icon: "gear",
          },
        ],
      }),
      accountSettings: createZStatic({
        zContract: "ReferenceList",
        items: [
          {
            key: "profile",
            name: "Profile",
            path: ["auth", "user", "accountSettingsProfile"],
            icon: "user",
          },
          {
            key: "auth",
            name: "Auth",
            path: ["auth", "user", "accountSettingsAuth"],
            icon: "lock",
          },
        ],
        meta: {
          title: "Account Settings",
          icon: "user",
        },
      }),
      accountSettingsProfile: createZStatic({
        zContract: "ReferenceList",
        items: [
          {
            key: "userId",
            name: "User Id",
            path: ["auth", "user", "userId"],
            inline: true,
          },
          {
            key: "setUsername",
            name: "Set User ID",
            icon: "user",
            path: ["auth", "user", "setUsername"],
          },
          {
            key: "displayName",
            name: "Display Name",
            path: ["auth", "user", "displayName"],
            inline: true,
          },
        ],
        meta: {
          title: "User Profile",
          icon: "user",
        },
      }),
      userId: createZGettable(
        {
          type: "string",
          title: "User ID",
        } as const,
        async () => {
          return userId;
        },
      ),
      displayName: createZGettable(
        {
          type: "string",
          title: "Display Name",
        } as const,
        async () => {
          return userId;
        },
      ),
      accountSettingsAuth: createZStatic({
        zContract: "ReferenceList",
        items: [
          {
            key: "password",
            name: "Password",
            path: ["auth", "user", "password"],
            inline: true,
          },
          {
            key: "setPassword",
            name: "Set Password",
            path: ["auth", "user", "setPassword"],
          },
        ],
        meta: {
          title: "Auth Settings",
          icon: "lock",
        },
      }),
      password: createZGettable(
        {
          oneOf: [
            {
              type: "string",
              title: "Password",
            },
            { type: "null", title: "No Password Set" },
          ],
        } as const,
        async () => {
          const profile = await user.profile.get();
          if (profile.hasPassword) return "****";
          return null;
        },
      ),
      ...storeGroup,
    };
  }
  async function doesEntityStoreExist(entityId: string, storeId: string) {
    const storePath = getEntityStoreDir(entityId, storeId);
    return await pathExists(storePath);
  }

  const zRoot = createZMetaContainer(
    {
      store: zAnnotateCache(
        createZGroup(async (userId: string) => {
          return createZGroup(async (storeId: string) => {
            const memStore = await getMemoryStore(userId, storeId);
            return createZContainer({
              state: memStore.store.z.State,
            });
          });
        }),
        { isPrivate: false },
      ),
      auth: zAuth,
      buildInfo: createZStatic(publicBuildInfo),
    },
    {
      zIndex: ["auth"],
    },
  );

  await startZedServer(port, zRoot, logServerEvent);

  logEvent("DidStartServer", {
    port,
    dataDir,
    secretsFile, // this is just the path. we should avoid logging real secrets if possible
    logPath,
    publicBuildInfo,
  });
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
