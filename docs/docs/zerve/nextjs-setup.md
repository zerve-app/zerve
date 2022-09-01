---
title: Next.js Setup Guide
---

Guided setup for Zerve + Typescript + React Native Web in a Next app

This is the _manual_ setup guide. You can also copy the [complete example on GitHub here](https://github.com/zerve-app/example-web).

Alternatively, you can follow [Expo's Next.js guide](https://docs.expo.dev/guides/using-nextjs/) and jump to the [Zerve Setup](#set-up-zerve).

## Create a Next.js App

```
npx create-next-app zerve-example-app
```

## Add React-Native-Web

We are starting from the Next.js [Example support for React Native Web](https://github.com/vercel/next.js/blob/canary/examples/with-react-native-web/). First, install the dependencies:

```
yarn add react-native-web
yarn add -D babel-plugin-react-native-web
```

Then, copy each of the following files into your app:

- [`next.config.js`](https://github.com/vercel/next.js/blob/canary/examples/with-react-native-web/next.config.js)
- [`babel.config.js`](https://github.com/vercel/next.js/blob/canary/examples/with-react-native-web/babel.config.js)
- [`pages/_app.js`](https://github.com/vercel/next.js/blob/canary/examples/with-react-native-web/pages/_app.js)
- [`pages/_document.js`](https://github.com/vercel/next.js/blob/canary/examples/with-react-native-web/pages/_document.js)
- [`app.json`](https://github.com/vercel/next.js/blob/canary/examples/with-react-native-web/app.json)

Now, you are ready to rewrite `pages/index.js` to use RNW:

```jsx
import { StyleSheet, Text, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.headline}>Welcome to React-Native-Web!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headline: {
    fontSize: 32,
  },
});
```

Start your app with `yarn dev`, and now React Native Web should be working! At this point you can remove the `styles/` folder, because RNW will handle styling for us.

## Set up TypeScript

First, install the relevant typescript packages:

```
yarn add -D typescript @types/react @types/node @types/react-native
```

Then, rename `pages/index.js` to `index.tsx`. At the top of this file, add `import React from 'react'` or else TS will get confused.

If you restart your server, Next sees that you're using TS, and it auto-creates a `tsconfig.json` for you.

Then, set `"moduleResolution": "node"` so that TS can see the definition files of modules we install.

Now, your `tsconfig.json` should look like this:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "incremental": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

Great, now the app supports React Native Web and TypeScript! You're ready to install Zerve.

## Set up Zerve CLI

Get started by installing the [Zerve CLI](./cli):

```
yarn add -D @zerve/cli
```

Now, add the following to your package:

```json title="package.json"
  "zerve": {
    "dynamicSync": {
      "DemoStore": "https://alpha.zerve.app/.z/store/ev/demo"
    }
  }
```

If you have an account on the [Zerve Alpha](https://alpha.zerve.app), you should replace "ev/demo" above with "my-user/my-store". You can rename "DemoStore" to anything you prefer– it is only used in this codebase.

```
yarn zerve-sync
```

The CLI creates `zerve/DemoStore` for you, with relevant code and types. You may also add the `prepare` script to your package, so that the sync happens automatically when you run `yarn`.

```json title="package.json"
  "scripts": {
    "prepare": "yarn zerve-sync",
```

## Set up Zerve Client

Now install the client-side libraries. [Zerve Client](./client) relies on [React Query](https://www.npmjs.com/package/react-query), so you should install that as well:

```
yarn add @zerve/client
yarn add react-query
```

You're ready to run `zerve-sync` to auto-generate your app's client code.

Before we use the client, we need to set up the QueryClient for React Query. Here we add it to `_app.js`, but the provider can also be added on each page:

```tsx title="pages/_app.js"
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </>
  );
}
```

### Use the Zerve Client in your App

Now you're ready to use your Zerve store from your app. The demo store has a "Banner" text entry. Here's an example where we display it from the index page:

```tsx name="pages/index.tsx"
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useBanner } from "../zerve/DemoStore";

export default function Home() {
  const { data, isLoading } = useBanner({
    onError: (err) => alert(err),
  });
  return (
    <View style={styles.container}>
      {isLoading ? <ActivityIndicator /> : null}
      <Text style={styles.headline}>{data}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headline: {
    fontSize: 32,
  },
});
```

Now you have a type-safe way to load content from the Zerve Store! At this point you may add entries and schemas to your store, and re-run `zerve-sync` to update your client.

See [Client](./client) for more details on the client.

### Zerve Content

You may optionally use Zerve's `react-native-content` presentation components for displaying content to the user. Currently the only one included is [`<HumanText />`](./human-text).

To set up the content views, you need to use `next-transpile-modules`. This allows the internal reference of "react-native" to be converted to "react-native-web"

First, install it:

```
yarn add @zerve/react-native-content
```

Then, run:

```
yarn add -D next-transpile-modules
```

Finally, modify `next.config.js` so that the content module gets transpiled:

```js
require("next-transpile-modules")(["@zerve/react-native-content"])(nextConfig);
```

Your final next config should look like this:

```js title="next.config.js"
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      "react-native$": "react-native-web",
    };
    config.resolve.extensions = [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ];
    return config;
  },
};

const withTM = require("next-transpile-modules")([
  "@zerve/react-native-content",
]);

module.exports = withTM(nextConfig);
```

> For a more complicated example that includes `next-compose-plugins` and `@expo/next-adapter` see the [web app next.config.js](https://github.com/zerve-app/zerve/blob/main/apps/zoo-web/next.config.js) in the Zerve repo.

### Present formatted HumanText in your App

Now you are ready to render `<HumanText />` in your app. Modify it with the following:

```tsx file="pages/index.tsx"
import { HumanText } from "@zerve/react-native-content/HumanText";

export default function Home() {
  const { data, isLoading } = useHeadline({
    onError: (err) => alert(err),
  });
  return (
    <View style={styles.container}>
      {isLoading ? <ActivityIndicator /> : null}
      {data && <HumanText value={data} />}
    </View>
  );
}
```

Run the next app with `yarn dev` and you should see the "Headline" content loaded from the [demo store API](https://alpha.zerve.app/.z/store/ev/demo/state/Headline/value).

See [HumanText](./human-text) for more details on this component.
