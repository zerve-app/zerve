import { startZedServer } from "@zerve/node";
import {
  createZAction,
  createZContainer,
  createZGettable,
  createZState,
  NullSchema,
  NumberSchema,
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

const listenPort = process.env.PORT || 3899;

export async function startApp() {
  console.log("Starting Data Dir", dataDir);
  const Data = await createCoreData(dataDir);

  const Store = await createGeneralStore(
    Data,
    createSystemFiles(join(dataDir, "DemoGenStoreCache")),
    "GenStore"
  );

  const zRoot = createZContainer({
    Store,
  });

  await startZedServer(listenPort, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
