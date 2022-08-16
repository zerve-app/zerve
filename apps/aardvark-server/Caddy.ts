import { Command } from "@zerve/system-commands";
import { WriteFile } from "@zerve/system-files";
import { DeploymentsState } from "./Deployments";

export async function applyCaddyfile(state: DeploymentsState) {
  await WriteFile.call({
    path: "/etc/caddy/Caddyfile",
    value: `
aardvark.zerve.dev {
  route /.z* {
    reverse_proxy http://localhost:8999
  }
  reverse_proxy http://localhost:8990
}

${Object.entries(state.specs).map(
  ([deploymentKey, spec]) => `
${deploymentKey}.zerve.dev {
  tls {
    dns cloudflare {env.CLOUDFLARE_AUTH_TOKEN}
  }
  route /.z* {
    reverse_proxy http://localhost:${spec.serverPort}
  }
  reverse_proxy http://localhost:${spec.webPort}
}
`
).join(`
`)}
`,
  });
  await Command.call({
    command: "caddy",
    args: ["reload", "--config", "/etc/caddy/Caddyfile"],
  });
}
