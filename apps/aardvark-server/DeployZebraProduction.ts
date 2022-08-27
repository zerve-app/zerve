import { createZAction, FromSchema, NullSchema } from "@zerve/core";
import { Command } from "@zerve/system-commands";
import { serverCommand } from "./Servers";

const DeployRequestSchema = {
  type: "object",
  properties: {},
  required: [],
  additionalProperties: false,
} as const;

let isDeploymentInProgress = false;

export const DeployZebraProduction = (buildId: string) =>
  createZAction(
    DeployRequestSchema,
    NullSchema,
    async ({}: FromSchema<typeof DeployRequestSchema>) => {
      if (isDeploymentInProgress) {
        throw new Error(
          "Cannot perform simultaneous deployments. Or maybe deployment has failed badly and aardvark needs restart",
        );
      }
      console.log("== DeployZebraProduction start");
      isDeploymentInProgress = true;

      const deploymentPath = "/home/zerve/zebra";
      const dataDir = "/home/zerve/zebra-data";
      const webPort = 8000;
      const serverPort = 8888;
      const buildPath = `/root/zebra-builds/${buildId}.tar.gz`;
      console.log(
        "= DeployZebraProduction ",
        JSON.stringify(
          { buildPath, deploymentPath, dataDir, webPort, serverPort, buildId },
          null,
          2,
        ),
      );

      console.log("= DeployZebraProduction clean up previous build pkg");
      await serverCommand("zebra", "rm -rf /root/PendingDeployment.tar.gz");
      await serverCommand("zebra", "rm -rf /home/zerve/prev-zebra");

      console.log("= DeployZebraProduction copy build pkg");
      await Command.call({
        command: `rsync`,
        args: [buildPath, "zebra:/root/PendingDeployment.tar.gz"],
      });

      console.log("= DeployZebraProduction unpack " + buildId);
      await serverCommand(
        "zebra",
        "tar -zxf /root/PendingDeployment.tar.gz -C /home/zerve/",
      );

      console.log("= DeployZebraProduction chown " + deploymentPath);
      await serverCommand(
        "zebra",
        `chown -R zerve:zerve /home/zerve/${buildId}`,
      );

      console.log("= DeployZebraProduction make data dir " + dataDir);
      await serverCommand("zebra", `mkdir -p ${dataDir}`);

      console.log("= DeployZebraProduction MOVE PREVIOUS " + deploymentPath);
      await serverCommand(
        "zebra",
        `mv ${deploymentPath} /home/zerve/prev-zebra`,
      );

      console.log("= DeployZebraProduction MOVE NEW " + buildId);
      await serverCommand(
        "zebra",
        `mv /home/zerve/${buildId} ${deploymentPath}`,
      );

      // apply systemd config
      // restart services
      // apply caddy config

      console.log("= DeployZebraProduction clean up previous deployment");
      await serverCommand("zebra", "rm -rf /home/zerve/prev-zebra");

      isDeploymentInProgress = false;
      console.log("== DeployZebraProduction: complete");

      return null;
    },
  );
