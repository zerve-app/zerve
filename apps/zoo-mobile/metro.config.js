// Learn more https://docs.expo.io/guides/customizing-metro
// /**
//  * @type {import('expo/metro-config')}
//  */
// const { getDefaultConfig } = require("expo/metro-config");
// const path = require("path");

// const projectRoot = __dirname;
// const workspaceRoot = path.resolve(__dirname, "../..");

// const config = getDefaultConfig(projectRoot);

// config.watchFolders = [workspaceRoot];
// config.resolver.nodeModulesPaths = [
//   path.resolve(projectRoot, "node_modules"),
//   path.resolve(workspaceRoot, "node_modules"),
// ];

// module.exports = config;

const { makeMetroConfig } = require("@rnx-kit/metro-config");
const MetroSymlinksResolver = require("@rnx-kit/metro-resolver-symlinks");

module.exports = makeMetroConfig({
  projectRoot: __dirname,
  resolver: {
    resolveRequest: MetroSymlinksResolver(),
  },
});
