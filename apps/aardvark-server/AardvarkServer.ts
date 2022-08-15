import { join } from "path";
import { startZedServer } from "@zerve/node";

import {
  createZAction,
  createZContainer,
  createZStatic,
  FromSchema,
  NullSchema,
  NumberSchema,
  StringSchema,
} from "@zerve/core";
import { createAuth, createEmailAuthStrategy } from "@zerve/auth";
import { createCoreData } from "@zerve/data";
import { createGeneralStore, GeneralStoreModule } from "@zerve/store";
import { createSystemFiles } from "@zerve/system-files";
import { createZMessageSMS } from "@zerve/message-sms-twilio";
import { createZMessageEmail } from "@zerve/message-email-sendgrid";
import { createSystemCommands } from "@zerve/system-commands";
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

const CmdResultSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    command: StringSchema,
    args: { type: "array", items: StringSchema },
    durationMs: NumberSchema,
    out: StringSchema,
    err: StringSchema,
    cwd: StringSchema,
    env: { type: "object", additionalProperties: StringSchema },
  },
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

  const [zAuth] = await createAuth({
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
        ZerveStore: Store,
        Data,
        SystemCommands,
        SystemFiles,
        BuildZebra: createZAction(
          NullSchema,
          { type: "array", items: CmdResultSchema } as const,
          async () => {
            const results: Array<FromSchema<typeof CmdResultSchema>> = [];
            async function cmd(
              command: string,
              args: string[],
              cwd?: string,
              env?: Record<string, string>
            ) {
              const startTime = Date.now();
              const { out, err } = await SystemCommands.z.command.call({
                command,
                args,
                cwd,
                env,
              });
              const endTime = Date.now();
              const cmdResult: FromSchema<typeof CmdResultSchema> = {
                command,
                args,
                out,
                err,
                cwd,
                env,
                durationMs: endTime - startTime,
              } as const;
              results.push(cmdResult);
              return cmdResult;
            }

            const { out: whoami } = await cmd("whoami", []);
            const runningAsUser = whoami?.replace("\n", "");
            if (runningAsUser !== "root") {
              throw new Error(
                "You are expected to run this as root on a dedicated debian machine. Sorry this is junk. glhf!"
              );
            }

            // verify assumption about build machine
            try {
              await cmd("lsb_release", ["-a"], "/");
            } catch (e) {
              if (e.message.match("ENOENT")) {
                // dont attempt build on a mac, because the build includes native stuff that needs to work on the production debian machine
                throw new Error(
                  "Should not run this build on non-debian machine"
                );
              }
              throw e;
            }

            // now we assume we are on a debian machine with root access
            await cmd("mkdir", ["-p", "/root/zebra-build-details"]);

            const buildTimeString = new Date()
              .toISOString()
              .slice(0, 19)
              .replace("T", "-")
              .replace(/:/g, "-");
            let buildId = buildTimeString;

            try {
              // clean up the previous build
              await cmd("rm", ["-rf", "/root/zebra-build"]);
              // fetch updates to the bare repo
              await cmd("git", ["fetch"], "/root/zerve.git");

              // gather a bit of info that will be included in the result log
              const { out: commitHash } = await cmd(
                "git",
                ["rev-parse", "main"],
                "/root/zerve.git"
              );
              if (!commitHash)
                throw new Error("Cannot identify the current git commit hash");
              await cmd("node", ["--version"], "/");
              await cmd("yarn", ["--version"], "/");

              const commitHashShort = commitHash.slice(0, 6);
              buildId = `${buildTimeString}-${commitHashShort}`;
              await cmd("echo", [`$BUILD_ID: "${buildId}"`]);

              const buildParentDir = "/root/zebra-unfinished-builds";
              await cmd("mkdir", ["-p", buildParentDir]);

              const buildDir = `${buildParentDir}/${buildId}`;

              // clone the build repo
              await cmd("git", [
                "clone",
                "--depth=1",
                "/root/zerve.git",
                buildDir,
              ]);
              // install dependencies
              await cmd("yarn", ["--frozen-lockfile"], buildDir, {
                NODE_ENV: "dev",
              });
              // clean up heavy stuff from
              await cmd(
                "rm",
                ["-rf", "./.git", "yarn-package-cache"],
                buildDir
              );
              // set up new git repo (I forget why...? maybe expo or next expect this)
              await cmd("git", ["init"], buildDir);
              await cmd("git", ["branch", "-m", "detached-main"], buildDir);
              // run build commands
              await cmd("yarn", ["workspace", "zebra-web", "build"], buildDir);
              await cmd(
                "yarn",
                ["workspace", "zebra-server", "build"],
                buildDir
              );
              // archive the build
              await cmd("mkdir", ["-p", "/root/zebra-builds"]);
              await cmd(
                "tar",
                [
                  "-zcvf", // this is so confusing
                  `/root/zebra-builds/${buildId}.tar.gz`,
                  `${buildId}/`, // dont remove this trailing slash!
                ],
                buildParentDir
              );
              // clean up
              await cmd("rm", ["-rf", buildDir]);
            } catch (e) {
              console.error("-----");
              console.error(
                `Build failed. Writing logs to /root/zebra-build-details/${buildId}.json`
              );
              console.error(e);
              console.error("-----");
              await SystemFiles.z.WriteJSON.call({
                path: `/root/zebra-build-details/${buildId}.json`,
                value: { error: e.toString(), results },
              });
              throw e;
            }
            console.log(
              `Build success, saved to /root/zebra-builds/${buildId}.tar.gz - Writing logs to /root/zebra-build-details/${buildId}.json`
            );
            await SystemFiles.z.WriteJSON.call({
              path: `/root/zebra-build-details/${buildId}.json`,
              value: {
                results,
              },
            });

            return results;
          }
        ),
        deployZebra: createZAction(NullSchema, NullSchema, async () => {
          console.log("Zebra deploy behavior?! You must be Eric");
          return null;
        }),
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
