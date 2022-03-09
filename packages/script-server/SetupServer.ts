import spawn, { SpawnOptions } from "@expo/spawn-async";
import { writeFile, mkdirp, readdir, fstat } from "fs-extra";
import axios from "axios";

// function createServiceFile(
//   name: string,
//   env: Record<string, number | string>,
//   workingDir: string,
//   execStart: string
// ): string {
//   const serviceFile = `
// [Unit]
// Description=ZService: ${name}
// After=network.target

// [Service]
// WorkingDirectory=${workingDir}
// Type=simple
// User=zerve
// ExecStart=${execStart}
// Restart=on-failure
// ${Object.entries(env)
//   .map(([k, v]) => `Environment="${k}=${v}"`)
//   .join("\n")}

// [Install]
// WantedBy=multi-user.target
// `;
//   return serviceFile;
// }

// // shell helper
// async function sh(command, args, options?: SpawnOptions) {
//   console.log("🚜 " + command + " " + args.join(" "));
//   options && console.log("⚙️ " + JSON.stringify(options));
//   const result = await spawn(command, args, {
//     stdio: "inherit",
//     ...options,
//   });
//   console.log(result.status === 0 ? "🟢" : "🛑" + "Status: " + result.status);
//   console.log(result.output.join("\n"));
//   if (result.status !== 0) {
//     throw new Error("Command did not succeed.");
//   }
//   return result;
// }

// // shell with quiet output
// async function shx(command, args, options?: SpawnOptions) {
//   console.log("🚜 " + command + " " + args.join(" "));
//   options && console.log("⚙️ " + JSON.stringify(options));
//   const result = await spawn(command, args, {
//     ...options,
//   });
//   console.log(result.status === 0 ? "🟢" : "🛑" + "Status: " + result.status);
//   console.log(result.output.join("\n"));
//   if (result.status !== 0) {
//     throw new Error("Command did not succeed.");
//   }
//   return result;
// }

// export type ServiceLoadedStatus = "loaded" | "not-found";
// export type ServiceActiveStatus = "active" | "inactive" | "failed";
// export type ServiceSubStatus = "running" | "dead" | "exited" | "failed";

// export type ServiceState = {
//   name: string;
//   loaded: ServiceLoadedStatus;
//   active: ServiceActiveStatus;
//   sub: ServiceSubStatus;
//   description: string;
// };

// export async function listInternalServices(): Promise<string[]> {
//   const services = await readdir("/etc/systemd/system");

//   return services.filter((serviceName) => !!serviceName.match("zerve"));
// }

// export async function getSystemdServices(): Promise<ServiceState[]> {
//   const serviceList = await sh(
//     "systemctl",
//     ["-l", "--type", "service", "--all"],
//     { stdio: null }
//   );
//   const serviceLines = serviceList.output.map((out) => out.split("\n")).flat(1);
//   const services = serviceLines
//     .map((serviceLine) =>
//       serviceLine.match(/^.\s([^\s]*)\s*([^\s]*)\s*([^\s]*)\s*([^\s]*)\s*(.*)$/)
//     )
//     .filter((s, index) => !!s && index !== 0)
//     .map((match) => ({
//       name: match[1],
//       loaded: match[2] as ServiceLoadedStatus,
//       active: match[3] as ServiceActiveStatus,
//       sub: match[4] as ServiceSubStatus,
//       description: match[5].trim(),
//     }));
//   return services;
// }

// async function findNewUnixPort(retryCount = 4) {
//   const randomUserPort = 8000 + Math.floor(Math.random() * 41151);
//   const checkedUserPort = await new Promise<string[]>((resolve, reject) =>
//     egrep(
//       {
//         pattern: `${randomUserPort}/(tcp|udp)`,
//         files: ["/etc/services"],
//       },
//       (error, res) => (error ? reject(error) : resolve(res as string[]))
//     )
//   );
//   if (checkedUserPort.length) {
//     if (retryCount <= 0) throw new Error("Cannot find available unix port.");
//     return findNewUnixPort(retryCount - 1);
//   }
//   return randomUserPort;
// }

// async function expectHTTPOK(url: string) {
//   const healthCheck = await axios(url);
//   if (healthCheck.status === 200) return;
//   throw new Error(
//     `Expected ${url} to have status 200. Received: ${healthCheck.status}`
//   );
// }

// async function waitForHTTPOK(url: string, timeout = 15000) {
//   const start = Date.now();
//   let error = null;
//   try {
//     const healthCheck = await axios(url);
//     if (healthCheck.status === 200) return;
//   } catch (e) {
//     error = e;
//   }
//   const delta = Date.now() - start;
//   const nextTimeout = timeout - delta;
//   if (nextTimeout <= 0)
//     throw error || new Error("Waited past timeout and HTTP is not Ok.");
//   return await waitForHTTPOK(url, nextTimeout);
// }

async function setupServer(): Promise<void> {
  console.log("To do: set up the debian server for production");

  //   const install = await sh("/usr/bin/yarn", ["install:all"], {
  //     cwd: buildPath,
  //   });

  //   const build = await sh("/usr/bin/yarn", ["build"], {
  //     cwd: buildPath,
  //   });

  //   await mkdirp("/root/build-archive");

  //   const buildArchivePath = `/root/build-archive/${buildId}-${gitId}.tar.gz`;

  //   const pkgCreate = await sh("tar", ["-czf", buildArchivePath, "."], {
  //     cwd: buildPath,
  //   });

  //   await sh("rm", ["-rf", buildPath]);

  //   console.log(`✅ Build complete and archived at ${buildArchivePath}`);

  //   const deployId = buildId; // maybe we will seperate these I guess. each build can be deployed several times, in theory.
  //   const deployPath = `/home/zerve/deploy/${deployId}`;

  //   console.log(`🚲 Creating deployment at ${deployPath}`);

  //   await mkdirp(deployPath);

  //   const pkgUnpkg = await sh("tar", [
  //     "-xzf",
  //     buildArchivePath,
  //     "-C",
  //     deployPath,
  //   ]);

  //   const chown = await sh("chown", ["-R", `zerve:zerve`, `/home/zerve/deploy`]);

  //   const apiServiceName = `zerve-api-${deployId}`;

  //   const apiPort = await findNewUnixPort();

  //   await writeFile(
  //     `/etc/systemd/system/${apiServiceName}.service`,
  //     createServiceFile(
  //       "api",
  //       { ...apiEnv, PORT: apiPort },
  //       `${deployPath}/api`,
  //       `/usr/bin/node ${deployPath}/api/build/api/src/Server.js`
  //     )
  //   );

  //   const daemonReload0 = await sh("systemctl", ["daemon-reload"]);

  //   const apiServiceStart = await sh("service", [apiServiceName, "start"]);

  //   const apiServiceEnable = await sh("systemctl", ["enable", apiServiceName]);

  //   await waitForHTTPOK(`http://localhost:${apiPort}/api/health`);

  //   console.log(`✅ API (port ${apiPort}) Health reports status 200`);

  //   const webServiceName = `zerve-web-${deployId}`;

  //   const webPort = await findNewUnixPort();

  //   await writeFile(
  //     `/etc/systemd/system/${webServiceName}.service`,
  //     createServiceFile(
  //       "api",
  //       { ...webEnv, PORT: webPort },
  //       `${deployPath}/web`,
  //       "/usr/bin/yarn start"
  //     )
  //   );

  //   const daemonReload1 = await sh("systemctl", ["daemon-reload"]);

  //   const webServiceStart = await sh("service", [webServiceName, "start"]);

  //   const webServiceEnable = await sh("systemctl", ["enable", webServiceName]);

  //   await waitForHTTPOK(`http://localhost:${webPort}/health`);

  //   console.log(`✅ Web (port ${webPort}) Health reports status 200`);

  //   await writeFile(
  //     "/root/deploy_status.json",
  //     JSON.stringify(
  //       {
  //         webServiceName,
  //         apiServiceName,
  //         apiPort,
  //         webPort,
  //         time,
  //         gitId,
  //         buildId,
  //         deployId,
  //         deployPath,
  //       },
  //       null,
  //       2
  //     )
  //   );

  //   const caddyfileData = `
  // zerve.app {
  //   tls {
  //     dns cloudflare {env.CLOUDFLARE_AUTH_TOKEN}
  //   }
  //   route /api/* {
  //     reverse_proxy http://localhost:${apiPort}
  //   }
  //   reverse_proxy http://localhost:${webPort}
  // }
  // www.zerve.app {
  //   tls {
  //     dns cloudflare {env.CLOUDFLARE_AUTH_TOKEN}
  //   }
  //   redir https://zerve.app{uri} permanent
  // }
  // `;
  //   await writeFile("/etc/caddy/Caddyfile", caddyfileData);

  //   await sh("caddy", ["reload", "-config", "/etc/caddy/Caddyfile"]);

  //   console.log("✅ Caddy Config Deployed. ", { webPort, apiPort });

  //   await expectHTTPOK(`https://zerve.app/health`);
  //   await expectHTTPOK(`https://zerve.app/api/health`);

  //   const services = await getSystemdServices();
  //   const apiService = services.find(
  //     (s) => s.name === `${apiServiceName}.service`
  //   );
  //   if (apiService.active !== "active") throw new Error("API Service not active");
  //   if (apiService.sub !== "running") throw new Error("API Service not running");
  //   const webService = services.find(
  //     (s) => s.name === `${webServiceName}.service`
  //   );
  //   if (webService.active !== "active") throw new Error("Web Service not active");
  //   if (webService.sub !== "running") throw new Error("Web Service not running");

  //   console.log("✅ Servers Healthy. ");

  //   const serviceList = await listInternalServices();
  //   const apiServices = serviceList.filter((s) => s.match(/^zerve\-api\-/));
  //   const webServices = serviceList.filter((s) => s.match(/^zerve\-web\-/));
  //   const oldAPIServices = apiServices.filter(
  //     (s) => s !== `${apiServiceName}.service`
  //   );
  //   const oldWebServices = webServices.filter(
  //     (s) => s !== `${webServiceName}.service`
  //   );

  //   let destroyAllServices = Promise.resolve();

  //   const servicesToDestroy = [...oldAPIServices, ...oldWebServices];
  //   servicesToDestroy.forEach((oldService) => {
  //     destroyAllServices = destroyAllServices.then(async () => {
  //       const oldDeployId = oldService.match(/^(.*)\.service$/)[1];
  //       await sh("systemctl", ["stop", oldService]);
  //       try {
  //         await sh("rm", ["-rf", `/home/zerve/deploy/${oldDeployId}`]);
  //       } catch (e) {
  //         console.error("error deleting deployment " + oldDeployId);
  //         console.error(e);
  //       }
  //       await sh("rm", [`/etc/systemd/system/${oldService}`]);
  //     });
  //   });

  //   await destroyAllServices;
  //   await sh("systemctl", ["daemon-reload"]);

  //   console.log(
  //     "✅ Stopped and removed previous services: " + servicesToDestroy.join(", ")
  //   );
}

setupServer().catch((e) => {
  console.error(e);
  process.exit(1);
});
