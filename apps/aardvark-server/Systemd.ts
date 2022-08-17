import { Command } from "@zerve/system-commands";
import {
  DeleteRecursive,
  Exists,
  joinPath,
  WriteFile,
} from "@zerve/system-files";
import { DeploymentsPath, DeploymentsState } from "./Deployments";

export async function writeSystemdServiceFile(params: {
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
  ([envName, envValue]) => `Environment=${envName}="${envValue}"`,
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

export async function systemdStopAndDisable(serviceKey: string) {
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

export async function systemdReloadConfig() {
  await Command.call({
    command: "systemctl",
    args: ["daemon-reload"],
  });
}

export async function systemdStartAndEnable(serviceKey: string) {
  await Command.call({
    command: "systemctl",
    args: ["start", serviceKey],
  });
  await Command.call({
    command: "systemctl",
    args: ["enable", serviceKey],
  });
}

export async function applySystemdConfig(state: DeploymentsState) {
  await DeleteRecursive.call("/etc/systemd/system/z.*");
  await Promise.all(
    Object.entries(state.specs).map(async ([deploymentName, deploySpec]) => {
      await writeSystemdServiceFile({
        serviceKey: `z.${deploymentName}.server`,
        workingDir: joinPath(
          DeploymentsPath,
          deploymentName,
          "apps/zebra-server",
        ),
        execStart: `/usr/bin/node ${joinPath(
          DeploymentsPath,
          deploymentName,
          "apps/zebra-server/build/ZebraServer.js",
        )}`,
        env: {
          PORT: String(deploySpec.serverPort),
          NODE_ENV: "production",
          Z_ORIGIN: `https://${deploymentName}.zerve.dev`,
          ZERVE_DATA_DIR: deploySpec.dataDir,
        },
      });
      await writeSystemdServiceFile({
        serviceKey: `z.${deploymentName}.web`,
        workingDir: joinPath(DeploymentsPath, deploymentName, "apps/zebra-web"),
        execStart: `${joinPath(
          DeploymentsPath,
          deploymentName,
          "node_modules/.bin/next",
        )} start`,
        env: {
          PORT: String(deploySpec.webPort),
          NODE_ENV: "production",
          Z_ORIGIN: `https://${deploymentName}.zerve.dev`,
        },
      });
    }),
  );
  await systemdReloadConfig();
}
