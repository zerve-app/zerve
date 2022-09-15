/** @type {import('next').NextConfig} */

const { readdirSync, readFileSync } = require("fs");
const { withPlugins } = require("next-compose-plugins");
const packageDirNames = readdirSync("../../packages");
const packageJsons = packageDirNames.map((pkgName) => {
  try {
    return JSON.parse(
      readFileSync(`../../packages/${pkgName}/package.json`, {
        encoding: "utf-8",
      }),
    );
  } catch (e) {
    return null;
  }
});

const localPackageNames = packageJsons.map((p) => p?.name).filter(Boolean);

const nextConfig = {
  reactStrictMode: false,
  webpack5: true,
  experimental: {
    images: {
      unoptimized: true,
    },
  },
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
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // disable later.
  productionBrowserSourceMaps: true,
};

const { withExpo } = require("@expo/next-adapter");
const withTM = require("next-transpile-modules")([
  "react-native",
  "react-native-web",
  ...localPackageNames,
]);

module.exports = withPlugins(
  [withTM, [withExpo, { projectRoot: __dirname }]],
  nextConfig,
);
