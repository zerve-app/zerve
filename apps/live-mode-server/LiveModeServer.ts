import { startZedServer } from "@zerve/node";
import { createZAction, createZContainer, createZGettable } from "@zerve/core";
import { ZOBSService } from "@zerve/obs";
export async function startApp() {
  const service = await ZOBSService.startInstance({});
  const zRoot = createZContainer({
    obs: service.z,
  });

  await startZedServer(9999, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});
