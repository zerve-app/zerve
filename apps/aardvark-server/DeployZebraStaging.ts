import { createZAction, FromSchema, NullSchema } from "@zerve/core";
import { Command } from "@zerve/system-commands";
import { DeleteRecursive, joinPath, MakeDir, Move } from "@zerve/system-files";
import { applyCaddyfile } from "./Caddy";
import {
  DeploymentsPath,
  DeploymentsState,
  readDeploymentsState,
  writeDeploymentsState,
} from "./Deployments";
import {
  applySystemdConfig,
  systemdStartAndEnable,
  systemdStopAndDisable,
} from "./Systemd";

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

const DataDirPath = "/home/zerve/deployments-data";

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

      // prepare data dir
      await MakeDir.call(dataDir);
      await Command.call({
        command: "chown",
        args: ["-R", "zerve:zerve", dataDir],
      });
      // apply systemd config
      await applySystemdConfig(state);

      await systemdStartAndEnable(`z.${deploymentName}.server`);
      await systemdStartAndEnable(`z.${deploymentName}.web`);

      await applyCaddyfile(state);

      return null;
    },
  );
