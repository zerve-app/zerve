const { execFileSync } = require("child_process");

const [_node, _scriptPath, packageName, ...args] = process.argv;

console.log(`Packing ${packageName}`);

require("./prepack");

console.log("Starting yarn publish");

execFileSync("yarn", ["publish", "--non-interactive", "--access", "public"], {
  cwd: `packages/${packageName}`,
  stdio: "inherit",
});
console.log("Completed yarn publish");

require("./postpack");
