import {
  createZAction,
  FromSchema,
  NullSchema,
  NumberSchema,
  StringSchema,
} from "@zerve/core";
import { Command } from "@zerve/system-commands";
import {
  Copy,
  DeleteRecursive,
  joinPath,
  ReadDir,
  WriteJSON,
} from "@zerve/system-files";

const CmdResultSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    command: StringSchema,
    args: { type: "array", items: StringSchema },
    durationMs: NumberSchema,
    out: StringSchema,
    err: StringSchema,
    cwd: StringSchema,
    env: { type: "object", additionalProperties: StringSchema },
  },
} as const;

let __is_build_in_progress_junky_check = false;

export const BuildZebra = createZAction(
  NullSchema,
  { type: "array", items: CmdResultSchema } as const,
  async () => {
    console.log("==== Starting BuildZebra ====");
    __is_build_in_progress_junky_check = true;
    if (__is_build_in_progress_junky_check) {
      throw new Error("a build is already in progress....");
    }
    const results: Array<FromSchema<typeof CmdResultSchema>> = [];
    async function cmd(
      command: string,
      args: string[],
      cwd?: string,
      env?: Record<string, string>
    ) {
      const startTime = Date.now();
      const { out, err } = await Command.call({
        command,
        args,
        cwd,
        env,
      });
      const endTime = Date.now();
      const cmdResult: FromSchema<typeof CmdResultSchema> = {
        command,
        args,
        out,
        err,
        cwd,
        env,
        durationMs: endTime - startTime,
      } as const;
      results.push(cmdResult);
      return cmdResult;
    }

    const { out: whoami } = await cmd("whoami", []);
    const runningAsUser = whoami?.replace("\n", "");
    if (runningAsUser !== "root") {
      throw new Error(
        "You are expected to run this as root on a dedicated debian machine. Sorry this is junk. glhf!"
      );
    }

    // verify assumption about build machine
    try {
      await cmd("lsb_release", ["-a"], "/");
    } catch (e) {
      if (e.message.match("ENOENT")) {
        // dont attempt build on a mac, because the build includes native stuff that needs to work on the production debian machine
        throw new Error("Should not run this build on non-debian machine");
      }
      throw e;
    }

    // now we assume we are on a debian machine with root access
    await cmd("mkdir", ["-p", "/root/zebra-build-details"]);

    const buildTimeString = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", "-")
      .replace(/:/g, "-");
    let buildId = buildTimeString;

    try {
      // clean up the previous build
      await cmd("rm", ["-rf", "/root/zebra-build"]);
      // fetch updates to the bare repo
      await cmd("git", ["fetch"], "/root/zerve.git");

      // gather a bit of info that will be included in the result log
      const { out: commitHash } = await cmd(
        "git",
        ["rev-parse", "main"],
        "/root/zerve.git"
      );
      if (!commitHash)
        throw new Error("Cannot identify the current git commit hash");
      await cmd("node", ["--version"], "/");
      await cmd("yarn", ["--version"], "/");

      const commitHashShort = commitHash.slice(0, 6);
      buildId = `${buildTimeString}-${commitHashShort}`;
      await cmd("echo", [`$BUILD_ID: "${buildId}"`]);

      const buildParentDir = "/root/zebra-unfinished-builds";
      await cmd("mkdir", ["-p", buildParentDir]);

      const buildDir = `${buildParentDir}/${buildId}`;

      // clone the build repo
      await cmd("git", ["clone", "--depth=1", "/root/zerve.git", buildDir]);
      // delete unrelated apps
      const allApps = await ReadDir.call(joinPath(buildDir, "apps"));
      const nonDeployedApps = allApps.filter(
        (appName) => appName !== "zebra-web" && appName !== "zebra-server"
      );
      await DeleteRecursive.call(
        nonDeployedApps.map((appName) => joinPath(buildDir, "apps", appName))
      );
      // install dependencies
      await cmd("yarn", ["--frozen-lockfile"], buildDir, {});

      // clean up heavy and unused stuff from build directory
      await DeleteRecursive.call([
        joinPath(buildDir, ".git"),
        joinPath(buildDir, "yarn-package-cache"),
      ]);

      // set up new git repo (I forget why...? maybe expo or next expect this)
      await cmd("git", ["init"], buildDir);
      await cmd("git", ["branch", "-m", "detached-main"], buildDir);

      // copy secrets file
      await Copy.call({
        from: "/root/secrets.json",
        to: joinPath(buildDir, "secrets.json"),
      });

      // run build commands
      await cmd("yarn", ["workspace", "zebra-web", "build"], buildDir);
      await cmd("yarn", ["workspace", "zebra-server", "build"], buildDir);
      // archive the build
      await cmd("mkdir", ["-p", "/root/zebra-builds"]);
      await cmd(
        "tar",
        [
          "-czf", // [c]create [z]compress [f]fileoutput
          `/root/zebra-builds/${buildId}.tar.gz`,
          `${buildId}/`, // dont remove this trailing slash!
        ],
        buildParentDir
      );
      // clean up
      await cmd("rm", ["-rf", buildDir]);
    } catch (e) {
      console.error("-----");
      console.error(
        `Build failed. Writing logs to /root/zebra-build-details/${buildId}.json`
      );
      console.error(e);
      console.error("-----");
      await WriteJSON.call({
        path: `/root/zebra-build-details/${buildId}.json`,
        value: { error: e.toString(), results },
      });
      __is_build_in_progress_junky_check = false;

      throw e;
    }
    console.log(
      `Build success, saved to /root/zebra-builds/${buildId}.tar.gz - Writing logs to /root/zebra-build-details/${buildId}.json`
    );
    await WriteJSON.call({
      path: `/root/zebra-build-details/${buildId}.json`,
      value: {
        results,
      },
    });
    __is_build_in_progress_junky_check = false;

    return results;
  }
);
