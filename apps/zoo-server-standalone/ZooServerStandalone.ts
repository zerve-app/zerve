import { startZedServer } from "@zerve/node";
import { createZContainer, zAnnotateCache } from "@zerve/zed";
import { createCoreData } from "@zerve/data";
import { createGeneralStore } from "@zerve/store";
import { joinPath } from "@zerve/system-files";
import { HumanTextSchema } from "@zerve/react-native-content/Schema";

const port = process.env.PORT ? Number(process.env.PORT) : 9888;

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
    { HumanText: HumanTextSchema },
  );

  const zRoot = createZContainer({
    state: zAnnotateCache(PublicStore.z.State, { isPrivate: false }),
    store: PublicStore,
  });

  await startZedServer(port, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
