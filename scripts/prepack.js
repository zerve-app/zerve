const { join, parse, basename } = require("path");
const {
  readFileSync,
  copySync,
  writeFileSync,
  mkdirpSync,
  readdirSync,
} = require("fs-extra");
const rimraf = require("rimraf");
const { build } = require("esbuild");

const packageName = process.argv[2];
if (!packageName)
  throw new Error(
    "package name not provided. try: node scripts/prepack.js $PACKAGE_NAME",
  );
const pkgPath = join(process.cwd(), "packages", packageName);
const distPath = join(pkgPath, "dist");
const pkgJsonPath = join(pkgPath, "package.json");
const ts = require("typescript");
const actualPkgJsonPath = join(pkgPath, "package.actual.json");
const package = JSON.parse(readFileSync(pkgJsonPath));
copySync(pkgJsonPath, actualPkgJsonPath);
const packPackage = { ...package };

rimraf.sync(distPath);
mkdirpSync(distPath);

const pkgFiles = readdirSync(pkgPath).filter((f) => {
  if (f.startsWith("index.")) return false;
  return f.endsWith(".tsx") || f.endsWith(".ts");
});

packPackage.files = [
  "dist/",
  ...pkgFiles.map((srcFile) => `${parse(srcFile).name}.js`),
  ...pkgFiles.map((srcFile) => `${parse(srcFile).name}.d.ts`),
];
// delete packPackage.scripts; // not doing this because the postpack script gets wiped out before usage. the distributed package should not need scripts but here we are
writeFileSync(pkgJsonPath, JSON.stringify(packPackage, null, 2));

pkgFiles.forEach((srcFile) => {
  const name = parse(srcFile).name;
  writeFileSync(
    join(pkgPath, `${name}.js`),
    `module.exports = require("./dist/${name}.js")`,
  );
  writeFileSync(
    join(pkgPath, `${name}.d.ts`),
    `export * from './dist/${name}'`,
  );
});

console.log("prepack.js Compiling Type Definitions.");
const tsOptions = {
  lib: ["ES2015"],
  module: "ESNext",
  target: "ES6",
  jsx: "react-jsx",
  declaration: true,
};
const host = ts.createCompilerHost(tsOptions);
host.writeFile = (fileName, contents) => {
  if (fileName.endsWith(".d.ts")) {
    writeFileSync(join(distPath, basename(fileName)), contents);
  }
};
const sourceFilePaths = pkgFiles.map((srcFile) => join(pkgPath, srcFile));
const program = ts.createProgram(sourceFilePaths, tsOptions, host);
program.emit();

console.log("prepack.js Compiling w/ esbuild.");

sourceFilePaths.forEach((srcPath) => {
  build({
    logLevel: "warning",
    minify: true,
    sourcemap: true,
    entryPoints: [srcPath],
    format: "cjs",
    outbase: pkgPath,
    outfile: join(pkgPath, "dist", `${parse(srcPath).name}.js`),
    target: ["esnext", "node12.22.0"],
  });
});

if (readdirSync(pkgPath).find((n) => n.endsWith(".d.js"))) {
  throw new Error("bad things happen during prepack, ok?!");
}

console.log("prepack.js Complete.");
