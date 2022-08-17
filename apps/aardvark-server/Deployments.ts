import {
  createZAction,
  createZContainer,
  createZGettableGroup,
  NullSchema,
  NumberSchema,
  StringSchema,
  FromSchema,
  validateWithSchema,
} from "@zerve/core";
import {
  DeleteRecursive,
  joinPath,
  ReadJSON,
  WriteJSON,
} from "@zerve/system-files";
import { applyCaddyfile } from "./Caddy";
import { applySystemdConfig, systemdStopAndDisable } from "./Systemd";

export const aardvarkDeploymentsPath = joinPath(
  process.env.HOME as string,
  "AardvarkDeployments.json",
);
export const DeploymentSpecSchema = {
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

export const DeploymentsStateSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    availPortIndex: NumberSchema,
    specs: { type: "object", additionalProperties: DeploymentSpecSchema },
  },
  required: ["availPortIndex", "specs"],
} as const;
export type DeploymentsState = FromSchema<typeof DeploymentsStateSchema>;

const DefaultDeploymentsState: DeploymentsState = {
  availPortIndex: 4000,
  specs: {},
};

export async function readDeploymentsState(): Promise<DeploymentsState> {
  const rawValue = await ReadJSON.call(aardvarkDeploymentsPath);
  if (rawValue == null) return DefaultDeploymentsState;
  const value = validateWithSchema(DeploymentsStateSchema, rawValue);
  return value;
}

export async function writeDeploymentsState(state: DeploymentsState) {
  const value = validateWithSchema(DeploymentsStateSchema, state);
  await WriteJSON.call({ path: aardvarkDeploymentsPath, value });
}

export const DeploymentsPath = "/home/zerve/deployments";

function getDeploymentDestroy(deploymentName: string) {
  return createZAction(NullSchema, NullSchema, async () => {
    const prevState = await readDeploymentsState();
    const newSpecs = { ...prevState.specs };
    delete newSpecs[deploymentName];
    // write to deployment config file
    const state: DeploymentsState = {
      ...prevState,
      specs: newSpecs,
    };
    await writeDeploymentsState(state);

    await systemdStopAndDisable(`z.${deploymentName}.server`);
    await systemdStopAndDisable(`z.${deploymentName}.web`);

    await applySystemdConfig(state);

    await applyCaddyfile(state);

    const deploymentPath = joinPath(DeploymentsPath, deploymentName);
    await DeleteRecursive.call(deploymentPath);

    return null;
  });
}

export const Deployments = createZGettableGroup(
  async (deploymentName: string) => {
    return createZContainer({
      Destroy: getDeploymentDestroy(deploymentName),
    } as const);
  },
  async () => {
    const state = await readDeploymentsState();
    return {
      children: Object.keys(state.specs),
      more: false,
      cursor: "",
    };
  },
);
