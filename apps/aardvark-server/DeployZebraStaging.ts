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
  systemdRestart,
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
      default: "staging",
    },
    replace: {
      title: "Replace Build",
      description: "",
      type: "boolean",
      default: false,
    },
  },
  required: ["deploymentName", "replace"],
  additionalProperties: false,
} as const;

const DataDirPath = "/home/zerve/deployments-data";

let __junky_check_disable_simultaneous_builds = false;

export const DeployZebraStaging = (buildId: string) =>
  createZAction(
    DeployRequestSchema,
    NullSchema,
    async ({
      deploymentName,
      replace,
    }: FromSchema<typeof DeployRequestSchema>) => {
      if (__junky_check_disable_simultaneous_builds) {
        throw new Error(
          "Cannot perform simultaneous builds right now. or maybe build has failed and aardvark needs restart",
        );
      }
      __junky_check_disable_simultaneous_builds = true;
      // check against deployment config file
      const prevState = await readDeploymentsState();
      if (
        (prevState.specs[deploymentName] && !replace) ||
        deploymentName === "aardvark"
      ) {
        throw new Error(
          "deployment with this name already exists. Use 'replace' instead?",
        );
      }
      if (replace && !prevState.specs[deploymentName]) {
        throw new Error("no deployment with this name to replace");
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
      if (replace) {
        await systemdStopAndDisable(`z.${deploymentName}.server`);
        await systemdStopAndDisable(`z.${deploymentName}.web`);
      }
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

      if (replace) {
        await systemdStartAndEnable(`z.${deploymentName}.server`);
        await systemdStartAndEnable(`z.${deploymentName}.web`);
      } else {
        await systemdRestart(`z.${deploymentName}.server`);
        await systemdRestart(`z.${deploymentName}.web`);
      }

      await applyCaddyfile(state);

      __junky_check_disable_simultaneous_builds = false;

      return null;
    },
  );
