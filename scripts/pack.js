const { execFileSync } = require("child_process");
const { readFileSync, removeSync, mkdirpSync } = require("fs-extra");

const [_node, _scriptPath, packageName, ...args] = process.argv;

console.log(`Packing ${packageName}`);

mkdirpSync("build");
removeSync(`build/${packageName}.tgz`);

require("./prepack");

console.log("Starting yarn pack");

execFileSync("yarn", ["pack", "--filename", `../../build/${packageName}.tgz`], {
  cwd: `packages/${packageName}`,
  stdio: "inherit",
});
console.log("Completed yarn pack");

require("./postpack");
