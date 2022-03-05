const { readdirSync } = require("fs");

const localIncludedModules = readdirSync(__dirname).filter((moduleName) => {
  if (moduleName === ".gitignore") return false;
  if (moduleName === "module.json") return false;
  if (moduleName === "index.ts") return false;
  if (moduleName === "tsconfig.json") return false;
  if (moduleName === "package.json") return false;
  if (moduleName === "modules.config.js") return false;
  if (moduleName === "node_modules") return false;
  return true;
});

module.exports = {
  // override this file in your fork

  // localIncludedModules: ["Auth", "CoreData", "Shell"],
  // localIncludedModules: ["Just", "Your", "Local", "Modules"]
  localIncludedModules,
};
