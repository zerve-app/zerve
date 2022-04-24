const { readFileSync, writeFileSync } = require("fs");

async function doBundleStep() {
  const fileData = readFileSync("./EditorEmbedOut.js", { encoding: "utf8" });
  writeFileSync(
    "./EditorBundleData.ts",
    `export const EditorBundleData = \`${fileData
      .replaceAll("`", "\\`")
      .replaceAll("${", "\\${")}\`;`
  );
}

doBundleStep()
  .then(() => {
    console.log("BUNDLED");
  })
  .catch((e) => {
    console.error(e);
  });
