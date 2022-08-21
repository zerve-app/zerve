/** @type {import('next').NextConfig} */

const { withPlugins } = require("next-compose-plugins");

const { withExpo } = require("@expo/next-adapter");
const withTM = require("next-transpile-modules")([
  "react-native",
  "react-native-web",
]);

module.exports = withPlugins(
  [withTM, [withExpo, { projectRoot: __dirname }]],
  {},
);
