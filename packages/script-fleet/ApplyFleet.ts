import SystemFiles from "@zerve/system-files";
import SystemCaddy from "@zerve/system-caddy";

const systemFiles = SystemFiles({ rootPath: "/" });

const systemCaddy = SystemCaddy();

async function applyFleet() {
  const uhh2 = await systemCaddy.get("ApplySystemConfig");
  await uhh2.call({
    hosts: [{ hostname: "hades.main.zerve.dev" }],
  });
  const files = await systemFiles.get("Files");
  console.log(files);
  const caddyFile = await files.get("etc/caddy/Caddyfile");
  if (caddyFile.zType === "Get") {
    const fileValue = await caddyFile.get("");
    console.log({ fileValue });
  }
}

applyFleet().catch((e) => {
  console.error(e);
  process.exit(1);
});
