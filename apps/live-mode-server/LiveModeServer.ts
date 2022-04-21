import { startZedServer } from "@zerve/node";
import { createZMetaContainer, createZStatic } from "@zerve/core";
import { ZOBSService } from "@zerve/obs";

export async function startApp() {
  const service = await ZOBSService.startInstance({});
  const zRoot = createZMetaContainer(
    {
      obs: service.z,
      ActiveScene: createZStatic({
        ".z": { z: "Reference", path: ["obs", "activeScene"] },
      }),
      ControlPanel: createZStatic([
        { ".z": { z: "Reference", path: ["obs", "activeScene"] } },
        { ".z": { z: "Reference", path: ["obs", "recordingStatus"] } },
        { ".z": { z: "Reference", path: ["obs", "startRecording"] } },
        { ".z": { z: "Reference", path: ["obs", "stopRecording"] } },
      ]),
    },
    {
      main: "ControlPanel",
    }
  );
  await startZedServer(9999, zRoot);
}

startApp().catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  console.error(e.stack);
  process.exit(1);
});
