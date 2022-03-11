import { join } from "path";
import { startZotServer } from "@zerve/node";

import {
  createZAction,
  createZGroup,
  createZGettable,
  createZStatic,
  createZContainer,
  ZGettable,
} from "@zerve/core";
import { CoreData } from "@zerve/modules";

const portLOL = process.env.PORT ? Number(process.env.PORT) : 3888;
const dataDir =
  process.env.ZERVE_DATA_DIR ||
  (process.env.NODE_ENV === "dev"
    ? join(process.cwd(), "dev-data")
    : undefined);

export async function startApp() {
  const primaryDataZ = await CoreData.createCoreData(dataDir);
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
    ...primaryDataZ,
    types: createZContainer({
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

  await startZotServer(portLOL, rootZot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
