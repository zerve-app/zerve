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

let isDeploymentInProgress = false;

export const DeployZebraStaging = (buildId: string) =>
  createZAction(
    DeployRequestSchema,
    NullSchema,
    async ({
      deploymentName,
      replace,
    }: FromSchema<typeof DeployRequestSchema>) => {
      if (isDeploymentInProgress) {
        throw new Error(
          "Cannot perform simultaneous builds right now. or maybe build has failed and aardvark needs restart",
        );
      }
      console.log("== DeployZebraStaging start");
      isDeploymentInProgress = true;
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
      console.log(
        "= DeployZebraStaging writeDeploymentsState ",
        JSON.stringify(
          { deploymentPath, dataDir, webPort, serverPort },
          null,
          2,
        ),
      );

      // write to deployment config file
      const state: DeploymentsState = {
        availPortIndex,
        specs: {
          ...prevState.specs,
          [deploymentName]: { deploymentPath, webPort, serverPort, dataDir },
        },
      };
      console.log(
        "= DeployZebraStaging writeDeploymentsState ",
        JSON.stringify(state, null, 2),
      );
      await writeDeploymentsState(state);

      console.log("= DeployZebraStaging wrote state");
      // clean up previous deployment
      if (replace) {
        console.log(
          "= DeployZebraStaging systemdStopAndDisable " + deploymentName,
        );
        await systemdStopAndDisable(`z.${deploymentName}.server`);
        await systemdStopAndDisable(`z.${deploymentName}.web`);
      }
      console.log("= DeployZebraStaging cleanup " + deploymentPath);
      await DeleteRecursive.call(deploymentPath);

      console.log("= DeployZebraStaging prep " + DeploymentsPath);
      // copy deployment and fix ownership
      await MakeDir.call(DeploymentsPath);
      await Command.call({
        command: "chown",
        args: ["zerve:zerve", DeploymentsPath],
      });
      console.log("= DeployZebraStaging unpack " + buildId);
      await Command.call({
        command: "tar",
        args: [
          "-zxf", // [z]compressed [x]extract [f]file
          `/root/zebra-builds/${buildId}.tar.gz`,
          "-C",
          "/home/zerve/",
        ],
      });
      console.log("= DeployZebraStaging move " + buildId);
      await Move.call({
        from: joinPath("/home/zerve", buildId),
        to: deploymentPath,
      });
      console.log("= DeployZebraStaging chown " + deploymentPath);
      await Command.call({
        command: "chown",
        args: ["-R", "zerve:zerve", deploymentPath],
      });

      // prepare data dir
      console.log("= DeployZebraStaging data dir " + dataDir);
      await MakeDir.call(dataDir);
      await Command.call({
        command: "chown",
        args: ["-R", "zerve:zerve", dataDir],
      });
      // apply systemd config
      console.log("= DeployZebraStaging applySystemdConfig");
      await applySystemdConfig(state);

      if (replace) {
        console.log(
          "= DeployZebraStaging systemdStartAndEnable " + deploymentName,
        );
        await systemdStartAndEnable(`z.${deploymentName}.server`);
        await systemdStartAndEnable(`z.${deploymentName}.web`);
      } else {
        console.log("= DeployZebraStaging systemdRestart " + deploymentName);
        await systemdRestart(`z.${deploymentName}.server`);
        await systemdRestart(`z.${deploymentName}.web`);
      }

      console.log("= DeployZebraStaging applyCaddyfile");
      await applyCaddyfile(state);

      isDeploymentInProgress = false;
      console.log("== DeployZebraStaging: complete");

      return null;
    },
  );
