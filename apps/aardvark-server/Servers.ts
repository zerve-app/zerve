import {
  BooleanSchema,
  createZAction,
  NullSchema,
  StringSchema,
} from "@zerve/core";
import { TryCommand } from "@zerve/system-commands";
import { joinPath, ReadJSON } from "@zerve/system-files";

const secretsFile =
  process.env.ZERVE_SECRETS_JSON ||
  joinPath(process.cwd(), "../../secrets.json");

export async function serverCommand(serverName: string, command: string) {
  return await TryCommand.call({
    command: `ssh`,
    args: [serverName, "-tt", command],
  });
}
export async function ensureServerCommand(serverName: string, command: string) {
  const results = await serverCommand(serverName, command);
  if (results.responseCode !== 0) {
    console.log(results);
    throw new Error("Failed to run " + command);
  }
  return results;
}

export const setupServer = createZAction(
  {
    type: "object",
    additionalProperties: false,
    properties: {
      serverName: StringSchema,
      upgradey: BooleanSchema,
    },
    required: ["serverName", "upgradey"],
    default: {
      serverName: "zebra",
      upgradey: false,
    },
  } as const,
  NullSchema,
  async ({ serverName, upgradey }) => {
    async function serverCommand(command: string) {
      return await TryCommand.call({
        command: `ssh`,
        args: [serverName, "-tt", command],
      });
    }
    async function ensureServerCommand(command: string) {
      const results = await serverCommand(command);
      if (results.responseCode !== 0) {
        console.log(results);
        throw new Error("Failed to run " + command);
      }
      return results;
    }
    async function checkServerConnection() {
      const { out, err } = await serverCommand("uptime");
      const isConnected = out.includes(" up ");
      if (isConnected) {
        console.log("Connected to " + serverName);
      } else {
        console.log("Failed to check server uptime: ", { out, err });
        throw new Error("Could not connect to server " + serverName);
      }
    }

    let hasRunAptUpdate = false;
    async function aptUpdateIfNeeded() {
      if (!hasRunAptUpdate) {
        console.log("Running apt update");
        const { out, err, responseCode } = await serverCommand("apt update");
        if (!out.match("Done\r\r\n")) {
          console.log("Apt Update output:", { out, err, responseCode });
          throw new Error("apt update failed.");
        }
        hasRunAptUpdate = true;
      } else {
        console.log("Has already run apt update recently");
      }
    }
    async function aptInstall(packageName: string) {
      console.log("Running apt install " + packageName);
      const { out, err, responseCode } = await serverCommand(
        `apt install -y ${packageName}`,
      );
      if (responseCode !== 0) {
        console.log("Apt Install output:", { out, err, responseCode });
        throw new Error("Failed to install " + packageName);
      }
    }

    async function checkGit() {
      const { out, err, responseCode } = await serverCommand("git --version");
      let gitVersionOut = out;
      if (responseCode !== 0) {
        console.log("Git is not found. Installing...");
        await aptUpdateIfNeeded();
        await aptInstall("git");
        const { out, err, responseCode } = await serverCommand("git --version");
        if (responseCode !== 0) {
          console.log({ out, err, responseCode });
          throw new Error("Failed to install git");
        }
        gitVersionOut = out;
      }
      console.log("Git version: " + gitVersionOut);
      // await ensureServerCommand("git config pull.rebase true");
    }

    async function checkMosh() {
      const { out, err, responseCode } = await serverCommand("mosh --version");
      let moshVersionOut = out;
      if (responseCode !== 0) {
        console.log("mosh is not found. Installing...");
        await aptUpdateIfNeeded();
        await aptInstall("mosh");
        const { out, err, responseCode } = await serverCommand(
          "mosh --version",
        );
        if (responseCode !== 0) {
          console.log({ out, err, responseCode });
          throw new Error("Failed to install mosh");
        }
        moshVersionOut = out;
      }
      console.log("Mosh version: " + moshVersionOut);
    }

    async function checkRsync() {
      const { out, err, responseCode } = await serverCommand("rsync --version");
      let rsyncVersionOut = out;
      if (responseCode !== 0) {
        console.log("rsync is not found. Installing...");
        await aptUpdateIfNeeded();
        await aptInstall("rsync");
        const { out, err, responseCode } = await serverCommand(
          "rsync --version",
        );
        if (responseCode !== 0) {
          console.log({ out, err, responseCode });
          throw new Error("Failed to install rsync");
        }
        rsyncVersionOut = out;
      }
      console.log("rsync version: " + rsyncVersionOut);
    }

    async function checkSSHKey() {
      const { out: pubKeyOut, responseCode } = await serverCommand(
        "cat /root/.ssh/id_rsa.pub",
      );
      if (responseCode === 0) {
        console.log("Server public key: ", pubKeyOut);
        return;
      }
      console.log("Generating server key");
      const sshKeygenOut = await serverCommand(
        "ssh-keygen -f /root/.ssh/id_rsa -N ''",
      );
      if (sshKeygenOut.responseCode !== 0) {
        console.log(sshKeygenOut);
        throw new Error("Failed to create server key pair");
      }
      const keyRead = await serverCommand("cat /root/.ssh/id_rsa.pub");
      if (keyRead.responseCode !== 0) {
        throw new Error("Failed to find server public key");
      }
      console.log("Server public key: ", keyRead.out);
    }

    async function checkNode16() {
      const nodeVersion = await serverCommand("node --version");
      if (nodeVersion.responseCode === 0) {
        console.log("Node version: " + nodeVersion.out);
        return;
      }
      console.log("Installing nodejs 16");
      await ensureServerCommand(
        "curl -fsSL https://deb.nodesource.com/setup_16.x | bash -",
      );
      await ensureServerCommand("apt-get install -y nodejs");
      const nodeInstalledVersion = await ensureServerCommand("node --version");
      console.log("Installed Node version: " + nodeInstalledVersion.out);
    }

    async function checkYarn() {
      const yarnVersion = await serverCommand("yarn --version");
      if (yarnVersion.responseCode === 0) {
        console.log("Yarn version: " + yarnVersion.out);
        return;
      }
      console.log("Installing yarn");
      await ensureServerCommand("npm install -g yarn");
      const yarnInstalledVersion = await ensureServerCommand("yarn --version");
      console.log("Installed Yarn version: " + yarnInstalledVersion.out);
    }

    async function checkCaddy() {
      const caddyVersion = await serverCommand("caddy version");
      if (caddyVersion.responseCode === 0) {
        console.log("Caddy version: " + caddyVersion.out);
        return;
      }
      console.log("Installing caddy");
      await aptInstall("debian-keyring");
      await aptInstall("debian-archive-keyring");
      await aptInstall("apt-transport-https");
      await ensureServerCommand(
        "curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg",
      );
      await ensureServerCommand(
        "curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list",
      );
      await ensureServerCommand("apt update");
      await ensureServerCommand("sudo apt install -y caddy");
      await ensureServerCommand("systemctl stop caddy");
      await ensureServerCommand(
        "curl -o /usr/bin/caddy -L 'https://caddyserver.com/api/download?os=linux&arch=amd64&p=github.com%2Fcaddy-dns%2Fcloudflare&idempotency=81071685807062'",
      );
      await ensureServerCommand("chmod ugo+x /usr/bin/caddy");
      await ensureServerCommand("systemctl start caddy");
      const caddyInstalledVersion = await ensureServerCommand("caddy version");
      console.log("Installed Caddy version: " + caddyInstalledVersion.out);
    }

    async function writeTextFile(path: string, value: string) {
      await ensureServerCommand(`cat <<EOF > ${path}
${value}
EOF`);
    }
    async function readTextFile(path: string) {
      const catResult = await serverCommand(`cat ${path}`);
      if (catResult.responseCode !== 0) return undefined;
      const returnedContent = catResult.out
        .split("\r\n")
        .slice(0, -1)
        .join("\n");
      return returnedContent || undefined;
    }

    async function ensureTextFile(path: string, value: string) {
      let didWrite = false;
      const prevFile = await readTextFile(path);
      if (prevFile !== value) {
        await writeTextFile(path, value);
        console.log("Wrote " + path);
        didWrite = true;
      } else {
        console.log("Verified " + path + " content is correct.");
      }
      return didWrite;
    }

    async function ls(path: string) {
      const lsResult = await ensureServerCommand("ls /home/zerve");
      const dirContent = lsResult.out.split("\r\n").filter((s) => s !== "");
      return dirContent;
    }

    async function checkZerveUser() {
      const passwd = await readTextFile("/etc/passwd");
      if (!passwd) throw new Error("Cannot read /etc/passwd");
      const userList = passwd.split("\n").map((userEntry) => {
        return userEntry.split(":")[0];
      });
      const hasZerveUser = userList.indexOf("zerve") !== -1;
      if (!hasZerveUser) {
        console.log("Creating zerve user.");
        await ensureServerCommand(
          'adduser --disabled-password --gecos "Zerve User" zerve',
        );
      }
      const zerveHomeContent = await ls("/home/zerve");
    }

    const secrets = await ReadJSON.call(secretsFile);
    if (!secrets) {
      throw new Error("Secrets file could not be loaded.");
    }
    const cloudflareKey = (secrets as Record<string, string>)
      .ZebraCloudflareDNS;
    if (!cloudflareKey) {
      throw new Error('Could not find secret "ZebraCloudflareDNS"');
    }

    console.log("==== setupServer start ====");
    await checkServerConnection();
    if (upgradey) {
      await aptUpdateIfNeeded();
      console.log("Running apt upgrade");
      await ensureServerCommand("apt upgrade -y");
    }
    await checkGit();
    await checkMosh();
    await checkRsync();
    await checkSSHKey();
    await checkNode16();
    await checkYarn();
    await checkCaddy();

    const caddyServiceConfig = `# caddy.service

[Unit]
Description=Caddy
Documentation=https://caddyserver.com/docs/
After=network.target network-online.target
Requires=network-online.target

[Service]
Type=notify
User=caddy
Group=caddy
ExecStart=/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile --force
TimeoutStopSec=5s
LimitNOFILE=1048576
LimitNPROC=512
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_BIND_SERVICE
Environment=CF_KEY=${cloudflareKey}

[Install]
WantedBy=multi-user.target`;
    const hasChangedCaddyService = await ensureTextFile(
      "/lib/systemd/system/caddy.service",
      caddyServiceConfig,
    );
    if (hasChangedCaddyService) {
      await ensureServerCommand("systemctl daemon-reload");
      await ensureServerCommand("systemctl restart caddy");
    }

    await checkZerveUser();

    console.log("==== setupServer complete");
    return null;
  },
);
