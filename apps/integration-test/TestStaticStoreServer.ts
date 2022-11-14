import { createCoreData } from "@zerve/data";
import { createGeneralStore } from "@zerve/store";
import { startZedServer } from "@zerve/node";
import { join as joinPath } from "path";
import { TestStoreSchemas, TestEntrySchemas } from "./TestStoreSchemas";

const dataDir = joinPath(process.cwd(), "test-data/static");

async function startServer() {
  const Data = await createCoreData(dataDir);

  const TestStore = await createGeneralStore(
    Data,
    joinPath(dataDir, "TestStoreCache"),
    "TestStore",
    {
      storeSchemas: TestStoreSchemas,
      entrySchemas: TestEntrySchemas,
    },
  );

  return await startZedServer(Number(process.env.PORT) || 9999, TestStore);
}

let closeServer = () => {};

console.log("starting TestStoreServer");
startServer()
  .then((server) => {
    closeServer = server.close;
  })
  .catch((e) => {
    console.error(e);
    console.log("Error Starting Server");
  });

process.on("SIGINT", () => {
  closeServer();
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("hihi sigterm!");
  closeServer();
});
