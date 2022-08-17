import { startZedServer } from "@zerve/node";
import { createZContainer } from "@zerve/core";
import { createCoreData } from "@zerve/data";
import { createGeneralStore } from "@zerve/store";
import { joinPath } from "@zerve/system-files";

const port = process.env.PORT ? Number(process.env.PORT) : 3888;

const homeDir = process.env.HOME;
const defaultZDataDir = `${homeDir}/.zerve`;

const dataDir =
  process.env.ZERVE_DATA_DIR ||
  (process.env.NODE_ENV === "dev"
    ? joinPath(process.cwd(), "dev-data")
    : defaultZDataDir);

export async function startApp() {
  console.log("Starting ZooServerStandalone. DataDir: " + dataDir);

  const Data = await createCoreData(dataDir);

  const PublicStore = await createGeneralStore(
    Data,
    joinPath(dataDir, "PublicStoreCache"),
    "PublicStore",
  );

  const zRoot = createZContainer({
    PublicStoreData: PublicStore.z.State,
    PublicStore,
  });

  await startZedServer(port, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
