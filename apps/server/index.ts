import { join } from "path";
import { startZedServer } from "@zerve/node";

import {
  createZAction,
  createZGroup,
  createZGettable,
  createZStatic,
  createZContainer,
  ZGettable,
} from "@zerve/core";
import { CoreData, SystemFiles, Ledger, CoreChain } from "@zerve/modules";
import SystemCommands from "@zerve/modules/SystemCommands/SystemCommands";
import { createZChainState } from "@zerve/modules/CoreChain/CoreChain";

const portLOL = process.env.PORT ? Number(process.env.PORT) : 3888;

const homeDir = process.env.HOME;
const defaultZDataDir = `${homeDir}/.zerve`;

const dataDir =
  process.env.ZERVE_DATA_DIR ||
  (process.env.NODE_ENV === "dev"
    ? join(process.cwd(), "dev-data")
    : defaultZDataDir);

export async function startApp() {
  const InternalRootFiles = SystemFiles.createSystemFiles("/");

  const primaryDataZ = await CoreData.createCoreData(dataDir);

  const ledgerCacheFiles = SystemFiles.createSystemFiles(
    join(dataDir, "LedgerStateCache")
  );

  const TestLedger = await CoreChain.createZChainState(
    primaryDataZ,
    ledgerCacheFiles,
    "MyTestLedger",
    Ledger.ChainLedgerCalculator
  );

  const InternalCommands = SystemCommands.createSystemCommands();

  // const data = createDataBase(context);

  // const testDataZ = createZGettable(
  //   { type: "string" } as const,
  //   async () => "Hello"
  // );

  // const testActionZ = createZAction(
  //   {
  //     type: "object",
  //     parameters: {
  //       url: { type: "string" },
  //     },
  //     required: ["url"],
  //   } as const,
  //   async ({ url }) => {
  //     console.log({ url });
  //   }
  // );
  // const GetValueSchema = { type: "string" } as const;
  // const testGroupZ = createZContainer<
  //   GetZot<typeof GetValueSchema, void>
  // >(async (key: string) => {
  //   return createZGettable(GetValueSchema, async () => {
  //     return `Wow, ${key}`;
  //   });
  // });
  // const testZContainer = createZContainer({
  //   action: testActionZ,
  //   data: testDataZ,
  //   group: testGroupZ,
  // });

  // const queryZot0 = await testZContainer.get("container");
  // const queryZot1 = await queryZot0.get("foobar");
  // const foo = await queryZot1?.get();
  // console.log({ foo });

  const rootZot = createZContainer({
    TestLedger,
    Internal: createZContainer({
      RootFiles: InternalRootFiles,
      Commands: InternalCommands,
    }),
    ...primaryDataZ,
    Types: createZContainer({
      Color: createZStatic({
        type: "object",
        properties: {
          r: { type: "number" },
          g: { type: "number" },
          b: { type: "number" },
        },
      }),
    }),
  });

  await startZedServer(portLOL, rootZot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
