import { startZedServer } from "@zerve/node";

import {
  createZAction,
  createZContainer,
  createZStatic,
  NullSchema,
  StringSchema,
} from "@zerve/core";
import { createAuth, createEmailAuthStrategy } from "@zerve/auth";
import { createCoreData } from "@zerve/data";
import { createGeneralStore, GeneralStoreModule } from "@zerve/store";
import { createZMessageSMS } from "@zerve/message-sms-twilio";
import { createZMessageEmail } from "@zerve/message-email-sendgrid";
import { Command } from "@zerve/system-commands";
import { CompletedBuilds } from "./CompletedBuilds";
import { BuildZebra } from "./BuildZebra";
import { DiskUsage } from "./DiskUsage";
import { Deployments } from "./Deployments";
import { joinPath, Move, ReadJSON } from "@zerve/system-files";
import { setupServer } from "./Servers";

const port = process.env.PORT ? Number(process.env.PORT) : 3988;

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

export async function startApp() {
  console.log("Starting AardvarkServer.");
  console.log("- DataDir: " + dataDir);

  const Data = await createCoreData(dataDir);

  const secrets = await ReadJSON.call(secretsFile);
  console.log("- SecretsFile: " + secretsFile);

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

  const Store = await createGeneralStore(
    Data,
    joinPath(dataDir, "ZerveStoreCache"),
    "ZerveStore",
  );

  const BuildAndDeployZebraStaging = createZAction(
    NullSchema,
    StringSchema,
    async () => {
      console.log("== BuildAndDeployZebraStaging ==");
      const build = await BuildZebra.call(null);
      const buildId = build.buildId;
      if (!buildId) throw new Error("buildId was returned from build");
      console.log("== BuildAndDeployZebraStaging: completed build " + buildId);
      const completedBuild = await CompletedBuilds.getChild(buildId);
      if (!completedBuild) {
        throw new Error(`Failed to find completed build ${buildId}`);
      }
      console.log(
        "== BuildAndDeployZebraStaging: deploying staging build " +
          (await completedBuild.z.BuildId.value),
      );
      await completedBuild.z.DeployStaging.call({
        deploymentName: "staging",
        replace: true,
      });
      console.log("== BuildAndDeployZebraStaging: completed success ==");
      return null;
    },
  );

  const [zAuth] = await createAuth({
    strategies: {
      Email: await createEmailAuthStrategy(Email, {
        domainAllowList: ["zerve.app"],
      }),
      // Phone: await createSMSAuthStrategy(SMS),
    },
    authFilesPath: joinPath(dataDir, "Auth"),
    handleUserIdChange: async (prevUserId: string, userId: string) => {
      try {
        await Move.call({
          from: joinPath(dataDir, "userData", prevUserId),
          to: joinPath(dataDir, "userData", userId),
        });
      } catch (e) {
        if (e.code === "ENOENT") return;
        throw e;
      }
    },
    getUserZeds: async (user, { userId }) => {
      return {
        ZerveStore: Store,
        Data,
        Command,
        DiskUsage,
        CompletedBuilds,
        BuildZebra,
        Deployments,
        BuildAndDeployZebraStaging,
        setupServer,
        ...user,
      };
    },
  });

  const zRoot = createZContainer({
    Info: createZStatic("Aardvark"),
    Zerve: Store.z.State,
    Auth: zAuth,
  });

  await startZedServer(port, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
