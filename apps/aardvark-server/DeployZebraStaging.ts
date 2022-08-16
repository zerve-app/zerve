import { createZAction, FromSchema, NullSchema } from "@zerve/core";

const DeployRequestSchema = {
  type: "object",
  properties: {
    buildId: {
      type: "string",
    },
    deploymentName: {
      type: "string",
    },
  },
  required: ["buildId", "deploymentName"],
} as const;

export const DeployZebraStaging = createZAction(
  DeployRequestSchema,
  NullSchema,
  async ({
    buildId,
    deploymentName,
  }: FromSchema<typeof DeployRequestSchema>) => {
    // check against deployment config file
    // write to deployment config file

    // copy deployment

    // create systemd config
    // reload systemd config

    // start systemd services

    // write caddyfile
    // apply caddyfile

    return null;
  }
);
