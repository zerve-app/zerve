import {
  createZAction,
  FromSchema,
  NullSchema,
  NumberSchema,
  StringSchema,
  validateWithSchema,
} from "@zerve/core";
import { Command } from "@zerve/system-commands";
import {
  DeleteRecursive,
  Exists,
  joinPath,
  MakeDir,
  Move,
  ReadJSON,
  WriteFile,
  WriteJSON,
} from "@zerve/system-files";

const DeployRequestSchema = {
  type: "object",
  properties: {
    deploymentName: {
      title: "Deployment Key",
      description: "Used as the *.zerve.dev subdomain",
      type: "string",
      example: "staging",
    },
  },
  required: ["deploymentName"],
  additionalProperties: false,
} as const;

const aardvarkDeploymentsPath = joinPath(
  process.env.HOME as string,
  "AardvarkDeployments.json"
);
const DeploymentSpecSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    serverPort: NumberSchema,
    webPort: NumberSchema,
    deploymentPath: StringSchema,
    dataDir: StringSchema,
  },
  required: ["serverPort", "webPort", "deploymentPath", "dataDir"],
} as const;

const DeploymentsStateSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    availPortIndex: NumberSchema,
    specs: { type: "object", additionalProperties: DeploymentSpecSchema },
  },
  required: ["availPortIndex", "specs"],
} as const;
type DeploymentsState = FromSchema<typeof DeploymentsStateSchema>;

const DefaultDeploymentsState: DeploymentsState = {
  availPortIndex: 4000,
  specs: {},
};

async function readDeploymentsState(): Promise<DeploymentsState> {
  const rawValue = await ReadJSON.call(aardvarkDeploymentsPath);
  if (rawValue == null) return DefaultDeploymentsState;
  const value = validateWithSchema(DeploymentsStateSchema, rawValue);
  return value;
}

async function writeDeploymentsState(state: DeploymentsState) {
  const value = validateWithSchema(DeploymentsStateSchema, state);
  await WriteJSON.call({ path: aardvarkDeploymentsPath, value });
}

const DeploymentsPath = "/home/zerve/deployments";
const DataDirPath = joinPath(process.env.HOME as string, "deployments-data");

async function writeSystemdServiceFile(params: {
  serviceKey: string;
  workingDir: string;
  execStart: string;
  env: Record<string, string>;
}) {
  const serviceFileValue = `[Unit]
Description=Zerve ${params.serviceKey} Service
After=network.target

[Service]
WorkingDirectory=${params.workingDir}
Type=simple
User=zerve
ExecStart=${params.execStart}
Restart=on-failure
${Object.entries(params.env).map(
  ([envName, envValue]) => `Environment=${envName}="${envValue}"`
).join(`
`)}

[Install]
WantedBy=multi-user.target
`;
  await WriteFile.call({
    path: joinPath("/etc/systemd/system", `${params.serviceKey}.service`),
    value: serviceFileValue,
  });
}

async function systemdStopAndDisable(serviceKey: string) {
  if (
    await Exists.call(joinPath("/etc/systemd/system", `${serviceKey}.service`))
  ) {
    await Command.call({
      command: "systemctl",
      args: ["stop", serviceKey],
    });
    await Command.call({
      command: "systemctl",
      args: ["disable", serviceKey],
    });
  }
}
async function systemdReloadConfig() {
  await Command.call({
    command: "systemctl",
    args: ["daemon-reload"],
  });
}

async function systemdStartAndEnable(serviceKey: string) {
  await Command.call({
    command: "systemctl",
    args: ["start", serviceKey],
  });
  await Command.call({
    command: "systemctl",
    args: ["enable", serviceKey],
  });
}

async function applyCaddyfile(state: DeploymentsState) {
  await WriteFile.call({
    path: "/etc/caddy/Caddyfile",
    value: `
aardvark.zerve.dev {
  route /.z* {
    reverse_proxy http://localhost:8999
  }
  reverse_proxy http://localhost:8990
}

${Object.entries(state.specs).map(
  ([deploymentKey, spec]) => `
${deploymentKey}.zerve.dev {
  tls {
    dns cloudflare {env.CLOUDFLARE_AUTH_TOKEN}
  }
  route /.z* {
    reverse_proxy http://localhost:${spec.serverPort}
  }
  reverse_proxy http://localhost:${spec.webPort}
}
`
).join(`
`)}
`,
  });
  await Command.call({
    command: "caddy",
    args: ["reload", "--config", "/etc/caddy/Caddyfile"],
  });
}

export const DeployZebraStaging = (buildId: string) =>
  createZAction(
    DeployRequestSchema,
    NullSchema,
    async ({ deploymentName }: FromSchema<typeof DeployRequestSchema>) => {
      // check against deployment config file
      const prevState = await readDeploymentsState();
      if (prevState.specs[deploymentName] || deploymentName === "aardvark") {
        throw new Error("deployment with this name already exists");
      }
      let { availPortIndex } = prevState;

      // determine deployment details
      const deploymentPath = joinPath(DeploymentsPath, deploymentName);
      const dataDir = joinPath(DataDirPath, deploymentName);
      const webPort = ++availPortIndex;
      const serverPort = ++availPortIndex;

      // write to deployment config file
      const state: DeploymentsState = {
        availPortIndex,
        specs: {
          ...prevState.specs,
          [deploymentName]: { deploymentPath, webPort, serverPort, dataDir },
        },
      };
      await writeDeploymentsState(state);

      // clean up previous deployment
      await systemdStopAndDisable(`z.${deploymentName}.server`);
      await systemdStopAndDisable(`z.${deploymentName}.web`);
      await DeleteRecursive.call(deploymentPath);

      // copy deployment and fix ownership
      await MakeDir.call(DeploymentsPath);
      await Command.call({
        command: "chown",
        args: ["zerve:zerve", DeploymentsPath],
      });
      await Command.call({
        command: "tar",
        args: [
          "-zxf", // [z]compressed [x]extract [f]file
          `/root/zebra-builds/${buildId}.tar.gz`,
          "-C",
          "/home/zerve/",
        ],
      });
      await Move.call({
        from: joinPath("/home/zerve", buildId),
        to: deploymentPath,
      });
      await Command.call({
        command: "chown",
        args: ["-R", "zerve:zerve", deploymentPath],
      });

      // create systemd configs
      await DeleteRecursive.call("/etc/systemd/system/z.*");
      await Promise.all(
        Object.entries(state.specs).map(
          async ([deploymentName, deploySpec]) => {
            await writeSystemdServiceFile({
              serviceKey: `z.${deploymentName}.server`,
              workingDir: joinPath(
                DeploymentsPath,
                deploymentName,
                "apps/zebra-server"
              ),
              execStart: `/usr/bin/node ${joinPath(
                DeploymentsPath,
                deploymentName,
                "apps/zebra-server/build/ZebraServer.js"
              )}`,
              env: {
                PORT: String(deploySpec.serverPort),
                NODE_ENV: "production",
                Z_ORIGIN: `https://${deploymentName}.zerve.dev`,
                ZERVE_DATA_DIR: dataDir,
              },
            });
            await writeSystemdServiceFile({
              serviceKey: `z.${deploymentName}.web`,
              workingDir: joinPath(
                DeploymentsPath,
                deploymentName,
                "apps/zebra-web"
              ),
              execStart: `${joinPath(
                DeploymentsPath,
                deploymentName,
                "node_modules/.bin/next start"
              )} start`,
              env: {
                PORT: String(deploySpec.webPort),
                NODE_ENV: "production",
                Z_ORIGIN: `https://${deploymentName}.zerve.dev`,
              },
            });
          }
        )
      );
      await systemdReloadConfig();

      await systemdStartAndEnable(`z.${deploymentName}.server`);
      await systemdStartAndEnable(`z.${deploymentName}.web`);

      await applyCaddyfile(state);

      return null;
    }
  );
