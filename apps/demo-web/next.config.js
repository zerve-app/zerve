const { readdirSync, readFileSync } = require("fs");
const { join, resolve } = require("path");
const { withPlugins } = require("next-compose-plugins");
const packageDirNames = readdirSync("../../packages");
const packageJsons = packageDirNames.map((pkgName) => {
  try {
    return JSON.parse(
      readFileSync(`../../packages/${pkgName}/package.json`, {
        encoding: "utf-8",
      })
    );
  } catch (e) {
    return null;
  }
});

const localPackageNames = packageJsons.map((p) => p?.name).filter(Boolean);
const transpileThese = [
  ...localPackageNames,
  "react-native", // ufhfhfhfhf this is bad. this fixes stuff on web which should not help because RN should always be aliased to RNW, but whoknows
  "react-native-web",
  "react-native-keyboard-aware-scroll-view",
  "react-native-reanimated",
  "react-native-gesture-handler",
  "expo-modules-core",
  "expo-font",
  "@expo/vector-icons",
];
const withTM = require("next-transpile-modules")(transpileThese);

module.exports = withPlugins([withTM], {
  reactStrictMode: true,
  webpack: (config, options) => {
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
    // config.module.rules.push({
    //   test: /\.js$/,
    //   exclude:
    //     /node_modules\/(?!(react-native-elements|react-native-vector-icons|\@expo\/vector-icons)\/).*/,
    //   loader: options.defaultLoaders.babel,
    // });
    config.module.rules.push({
      test: /\.ttf$/,
      loader: "url-loader",
      // include: /node_modules\/react-native-vector-icons\/*/,
      // include: resolve(
      //   __dirname,
      //   "../../node_modules/react-native-vector-icons"
      // ),
    });

    return config;
  },
});
