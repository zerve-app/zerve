import { join } from "path";
import { createServerContext, startZotServer } from "@zerve/node";

import {
  defineActionZot,
  defineContainerZot,
  defineGetZot,
  defineStaticContainerZot,
  GetZot,
} from "@zerve/core";

const port = process.env.PORT ? Number(process.env.PORT) : 3888;
const overrideDataDir =
  process.env.ZERVE_DATA_DIR ||
  (process.env.NODE_ENV === "dev"
    ? join(process.cwd(), "dev-data")
    : undefined);

export async function startApp() {
  const context = await createServerContext(port, overrideDataDir);
  // const data = createDataBase(context);

  const testDataZot = defineGetZot(
    { type: "string" } as const,
    async () => "Hello"
  );

  const testActionZot = defineActionZot(
    {
      type: "object",
      parameters: {
        url: { type: "string" },
      },
      required: ["url"],
    } as const,
    async ({ url }) => {
      console.log({ url });
    }
  );
  const GetValueSchema = { type: "string" } as const;
  const testContainerZot = defineContainerZot<
    GetZot<typeof GetValueSchema, void>
  >(async (key: string) => {
    return defineGetZot(GetValueSchema, async () => {
      return `Wow, ${key}`;
    });
  });
  const testStaticContainerZot = defineStaticContainerZot({
    action: testActionZot,
    data: testDataZot,
    container: testContainerZot,
  });

  // const queryZot0 = await testStaticContainerZot.get("container");
  // const queryZot1 = await queryZot0.get("foobar");
  // const foo = await queryZot1?.get();
  // console.log({ foo });

  await startZotServer(port, context, testStaticContainerZot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
