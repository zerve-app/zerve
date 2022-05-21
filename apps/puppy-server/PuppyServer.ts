import { startZedServer } from "@zerve/node";
import {
  BooleanSchema,
  createZAction,
  createZContainer,
  createZGettable,
  createZState,
  NullSchema,
  NumberSchema,
  StringSchema,
} from "@zerve/core";
import {
  createAuth,
  createEmailAuthStrategy,
  createSMSAuthStrategy,
  createTestAuthStrategy,
} from "@zerve/auth";
import { createCoreData } from "@zerve/data";
import { createGeneralStore } from "@zerve/store";
import { createSystemFiles } from "@zerve/system-files";
import { join } from "path";

const homeDir = process.env.HOME;
const defaultZDataDir = `${homeDir}/.zerve-demo`;

const dataDir =
  process.env.ZERVE_DATA_DIR ||
  (process.env.NODE_ENV === "dev"
    ? join(process.cwd(), "dev-data")
    : defaultZDataDir);

const listenPort = Number(process.env.PORT) || 3899;

export async function startApp() {
  console.log("Starting Data Dir", dataDir);
  const Data = await createCoreData(dataDir);

  const Store = await createGeneralStore(
    Data,
    createSystemFiles(join(dataDir, "DemoGenStoreCache")),
    "GenStore"
  );

  const RobotValue = createZState(NumberSchema, 0);

  const zRoot = createZContainer({
    Store,
    RobotValue,
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
        console.log(action);

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
