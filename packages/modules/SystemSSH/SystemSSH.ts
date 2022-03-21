import {
  createZAction,
  createZContainer,
  createZGettable,
  createZStatic,
  FromSchema,
  JSONSchema,
  RequestError,
} from "@zerve/core";
import { writeFile, stat, readdir, readFile, mkdirp, move } from "fs-extra";
import { join } from "path";
import SSHConfig from "ssh-config";
import { SystemCommandsModule } from "../SystemCommands/SystemCommands";

// takes an arbitrary value and grabs the subset of schema from it.
function jsonSchemaPluck<Schema extends JSONSchema>(
  schema: Schema,
  value: any
): FromSchema<Schema> {
  if (schema === true) return value;
  if (schema === false)
    throw new Error("Cannot pluck JSON value for false schema");
  const type = schema.type as string | undefined;
  if (!type) return value;
  if (Array.isArray(type))
    throw new Error("Pluck can not handle array type schemas yet");
  if (type === "object") return value; // todo pluck value according to object schema
  if (type === "array") return value; // todo pluck value according to object schema
  if (type === "string") return String(value);
  if (type === "number") return Number(value);
  if (type === "boolean") return Boolean(value);
  // fallback behavior does not pluck?? or should throw an error here?
  return value;
}

const SSHConfigSchema = {
  type: "object",
  additionalProperties: {
    type: "object",
    additionalProperties: false,
    properties: {
      hostName: { type: "string" },
      user: { type: "string" },
    },
  },
} as const;

function createSystemSSH(commands: SystemCommandsModule) {
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

const SystemSSH = {
  createSystemSSH,
};
export default SystemSSH;
