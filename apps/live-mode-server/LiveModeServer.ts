import { startZedServer } from "@zerve/node";
import { createZContainer } from "@zerve/core";
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
  console.error(e.stack);
  process.exit(1);
});
