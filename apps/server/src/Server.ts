import { createApp, createServerContext } from "@zerve/node";

import { createAuth } from "./Auth";
import { createDataBase } from "./DataBase";
import { AllModules } from "@zerve/modules";

export async function startApp(port: number, overrideDataDir?: string) {
  const context = await createServerContext(port, overrideDataDir);
  const data = createDataBase(context);

  const auth = createAuth(data);

  await createApp(port, context, AllModules, data, auth);
}
