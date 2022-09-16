// taken from the solito monorepo starter: https://github.com/nandorojo/solito/blob/master/example-monorepos/blank/apps/next/.babelrc.json

// @generated: @expo/next-adapter@4.0.12
// Learn more: https://github.com/expo/expo/blob/master/docs/pages/versions/unversioned/guides/using-nextjs.md#shared-steps

module.exports = {
  presets: ["next/babel", ["babel-preset-expo", { jsxRuntime: "automatic" }]],
  plugins: [
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    ["@babel/plugin-proposal-private-methods", { loose: true }],
    ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
    "react-native-reanimated/plugin",
  ],
};
