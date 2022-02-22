const { readdirSync, readFileSync } = require("fs");

const packageDirNames = readdirSync("../../packages");
const packageJsons = packageDirNames.map((pkgName) =>
  JSON.parse(
    readFileSync(`../../packages/${pkgName}/package.json`, {
      encoding: "utf-8",
    })
  )
);

const localPackageNames = packageJsons.map((p) => p.name);

const withTM = require("next-transpile-modules")(localPackageNames);

module.exports = withTM({
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      "react-native$": "react-native-web",
    };
    config.resolve.extensions = [
      ".web.js",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ];
    return config;
  },
});
