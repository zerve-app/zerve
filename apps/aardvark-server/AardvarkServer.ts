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
import {
  zWorkflow,
  zWorkflowEnvironment,
  zWorkflowCallStep,
} from "@zerve/core/Workflow";
const port = process.env.PORT ? Number(process.env.PORT) : 3988;

const homeDir = process.env.HOME;
const defaultZDataDir = `${homeDir}/.zerve`;

const dataDir =
  process.env.ZERVE_DATA_DIR ||
  (process.env.NODE_ENV === "dev"
    ? join(process.cwd(), "dev-data")
    : defaultZDataDir);

const secretsFile =
  process.env.ZERVE_SECRETS_JSON || join(process.cwd(), "../../secrets.json");

const BuildPayloadSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    commitId: { type: "string" },
  },
  required: ["commitId"],
} as const;

export async function startApp() {
  console.log("Starting AardvarkServer.");
  console.log("- DataDir: " + dataDir);

  const SystemCommands = createSystemCommands();
  const SystemFiles = createSystemFiles("/");
  const DataDirFiles = createSystemFiles(dataDir);
  const Data = await createCoreData(dataDir);

  const secrets = await SystemFiles.z.ReadJSON.call({
    path: secretsFile,
  });
  console.log("- SecretsFile: " + secretsFile);

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

  const Store = await createGeneralStore(
    Data,
    createSystemFiles(join(dataDir, "ZerveStoreCache")),
    "ZerveStore"
  );

  const zRoot = createZContainer({
    Info: createZStatic("Aardvark"),
    Zerve: Store.z.State,
    Auth: await createAuth({
      strategies: {
        Email: await createEmailAuthStrategy(Email, {
          domainAllowList: ["zerve.app"],
        }),
        // Phone: await createSMSAuthStrategy(SMS),
      },
      files: AuthFiles,
      handleUserIdChange: async (prevUserId: string, userId: string) => {
        try {
          await DataDirFiles.z.Move.call({
            from: join("userData", prevUserId),
            to: join("userData", userId),
          });
        } catch (e) {
          if (e.code === "ENOENT") return;
          throw e;
        }
      },
      getUserZeds: async (user, { userId }) => {
        return {
          // Workflows: zWorkflowEnvironment(
          //   {
          //     SystemCommands,
          //     SystemFiles,
          //   },
          //   {
          //     Uptime: zWorkflow({
          //       startPayloadSchema: NullSchema,
          //       steps: [
          //         zWorkflowCallStep(
          //           "SystemCommands/command",
          //           {
          //             command: "uptime",
          //             args: [],
          //           },
          //           { as: "uptimeResult" }
          //         ),
          //       ],
          //     }),
          //   }
          // ),
          ZerveStore: Store,
          Data,
          deployZebra: createZAction(NullSchema, NullSchema, async () => {
            console.log("Zebra deploy behavior?! You must be Eric");
            return null;
          }),
          ...user,
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
