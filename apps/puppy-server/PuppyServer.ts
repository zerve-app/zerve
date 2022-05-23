import { startZedServer } from "@zerve/node";
import {
  BooleanSchema,
  createZAction,
  createZContainer,
  createZGettable,
  createZMetaContainer,
  createZWorkflow,
  createZState,
  NullSchema,
  NumberSchema,
  StringSchema,
  zWorkflowCallStep,
} from "@zerve/core";
import {
  createAuth,
  createEmailAuthStrategy,
  createSMSAuthStrategy,
  createTestAuthStrategy,
} from "@zerve/auth";
import { createCoreData } from "@zerve/data";
import { createZDigitalOcean } from "@zerve/infra-digitalocean";
import { createGeneralStore } from "@zerve/store";
import { zCreateKeyPair } from "@zerve/system-ssh/SSHKeyPair";
import { createSystemFiles } from "@zerve/system-files";
import { join } from "path";

const homeDir = process.env.HOME;
const defaultZDataDir = `${homeDir}/.zerve-puppy`;

const dataDir =
  process.env.ZERVE_DATA_DIR ||
  (process.env.NODE_ENV === "dev"
    ? join(process.cwd(), "dev-data")
    : defaultZDataDir);

const listenPort = Number(process.env.PORT) || 3333;

const EstablishServerSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    // commitId: { type: "string" },
  },
  required: [],
} as const;

const secretsFile =
  process.env.ZERVE_SECRETS_JSON || join(process.cwd(), "../../secrets.json");

export async function startApp() {
  console.log("Starting Data Dir", dataDir);
  const Data = await createCoreData(dataDir);

  const Store = await createGeneralStore(
    Data,
    createSystemFiles(join(dataDir, "DemoGenStoreCache")),
    "GenStore"
  );

  const InternalRootFiles = createSystemFiles("/");

  const secrets = await InternalRootFiles.z.ReadJSON.call({
    path: secretsFile,
  });
  if (!secrets.DigitalOceanKey)
    throw new Error("DigitalOceanKey required in secrets file!");
  const DigitalOcean = await createZDigitalOcean({
    apiKey: secrets.DigitalOceanKey,
  });

  const EstablishServerWorkflow = createZWorkflow({
    startPayloadSchema: EstablishServerSchema,
    steps: [
      zWorkflowCallStep("zCreateKeyPair", null, { as: "key1" }),
      zWorkflowCallStep("zCreateKeyPair", null, { as: "key2" }),
      zWorkflowCallStep("zCreateKeyPair", null, {
        as: "keyAfter",
        after: ["key1", "key2"],
      }),
      // zWorkflowCallStep(
      //   "SetLights",
      //   { lightId: 1, isOn: false },
      //   { as: "turnOff" }
      // ),
      // zWorkflowCallStep(
      //   "SetLights",
      //   { lightId: 1, isOn: true },
      //   { after: "turnOff" }
      // ),
    ],
  });

  // const AardvarkServerConfig = zServerConfig({
  //   apps: {
  //     server: {
  //       repository: "https://github.com/zerve-app/zerve",
  //       app:"apps/zoo-server-aardvark",
  //       followRefspec: "main",
  //     },
  //     web: {
  //       repository: "https://github.com/zerve-app/zerve",
  //       app:"apps/zoo-web",
  //       followRefspec: "main",
  //       environment: {
  //         Z_ORIGIN: 'http://localhost:'
  //       }
  //     },
  //   },
  //   hosts: {
  //     "dev.zerve.app": {
  //       routes: [{ route: "z", appKey: "server" }, { appKey: "web" }],
  //     },
  //   },
  // });

  const RobotValue = createZState(NumberSchema, 0);

  const zRoot = createZContainer({
    Store,
    RobotValue,
    zCreateKeyPair,
    DigitalOcean,
    EstablishServerWorkflow,
    State: createZGettable(StringSchema, async () => "hello"),
    SetLights: createZAction(
      {
        type: "object",
        properties: {
          lightId: {
            title: "Hue Light ID",
            description: "What Hue light ID to set",
            type: "number",
          },
          isOn: { type: "boolean" },
        },
        required: ["lightId", "isOn"],
        additionalProperties: false,
      } as const,
      NullSchema,
      async (action) => {
        console.log("SET LIGHTS!");
        console.log(action);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        return null;
      }
    ),
  });

  await startZedServer(listenPort, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
