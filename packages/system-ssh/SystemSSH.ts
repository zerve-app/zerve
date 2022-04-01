import { createZAction, createZContainer, createZGettable } from "@zerve/core";
import { readFile } from "fs-extra";
import { join } from "path";
import SSHConfig from "ssh-config";
import { SystemCommandsModule } from "@zerve/system-commands";

const SSHConfigSchema = {
  type: "object",
  properties: {
    hosts: {
      type: "object",
      additionalProperties: {
        type: "object",
        required: ["hostName"],
        properties: {
          hostName: { type: "string" },
          user: { type: "string" },
        },
      },
    },
  },
  required: ["hosts"],
} as const;

export function createSystemSSH(commands: SystemCommandsModule) {
  const getSSHConfig = createZGettable(SSHConfigSchema, async () => {
    const configPath = join(process.env.HOME || "", ".ssh/config");
    const sshConfigRaw = await readFile(configPath, { encoding: "utf8" });
    const sshConfig = SSHConfig.parse(sshConfigRaw);
    console.log(JSON.stringify(sshConfig, null, 2));
    const hosts = Object.fromEntries(
      sshConfig
        .filter((entry) => entry.param === "Host")
        .map((hostEntry) => {
          return [
            hostEntry.value,
            {
              hostName: hostEntry.config.find(
                (e: any) => e.param === "HostName" || e.param === "Hostname"
              )?.value,
              user: hostEntry.config.find((e: any) => e.param === "User")
                ?.value,
            },
          ];
        })
    );
    return { hosts };
  });
  const CommandRemote = createZAction({} as const, {} as const, async () => {
    const ssh = await commands.z.commands.getChild("ssh");
    const result = await ssh.call({ args: ["-q", "hades", "uptime"] });
    console.log(result);
    return result.out;
  });
  const SystemSSH = createZContainer({
    SSHConfig: getSSHConfig,
    CommandRemote,
  });
  return SystemSSH;
}
