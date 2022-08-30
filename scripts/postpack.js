const { join } = require("path");
const { readFileSync, removeSync, moveSync } = require("fs-extra");
const rimraf = require("rimraf");

const packageName = process.argv[2];
if (!packageName)
  throw new Error(
    "package name not provided. try: node scripts/prepack.js $PACKAGE_NAME",
  );
const pkgPath = join(process.cwd(), "packages", packageName);
const pkgJsonPath = join(pkgPath, "package.json");
const package = JSON.parse(readFileSync(pkgJsonPath));
const files = package.files;
const distPath = join(pkgPath, "dist");
const actualPkgJsonPath = join(pkgPath, "package.actual.json");
files.map((localFile) => {
  if (localFile.endsWith(".d.ts") || localFile.endsWith(".js")) {
    removeSync(join(pkgPath, localFile));
  }
});
removeSync(pkgJsonPath);
rimraf.sync(distPath);
moveSync(actualPkgJsonPath, pkgJsonPath);

console.log("postpack.js completed");
