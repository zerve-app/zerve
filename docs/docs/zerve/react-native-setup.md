---
title: React Native Setup Guide
---

This guide walks through the setup of Zerve in a React Native app.

[See the full example code here](https://github.com/zerve-app/example-mobile), which you can use as a starter instead of following this walkthrough.

## Create App

This guide uses [Expo](https://expo.dev), but after the Typescript setup, it will work identically in any React Native app.

```
npx create-expo-app example-expo
```

## TS Setup

```
yarn add -D typescript @types/react @types/react-native
```

Rename `App.js` to `App.tsx`. At the top of the file, add `import React from "react";`

Run the app using `yarn ios` or `yarn android`, and Expo will automatically create a `tsconfig.js` for you.

## Install Zerve with CLI

Get started by installing the [Zerve CLI](./cli), the [Client](./client), and the [React Query](https://www.npmjs.com/package/react-query) peer dependency.

```
yarn add -D @zerve/cli
yarn add @zerve/client react-query
```

Now, add the following to your package:

```json title="package.json"
  "zerve": {
    "dynamicSync": {
      "DemoStore": "https://alpha.zerve.app/.z/store/ev/demo"
    }
  }
```

If you have an account on the [Zerve Alpha](https://alpha.zerve.app), you can create your own store. You should replace "ev/demo" above with "my-user/my-store". You can rename "DemoStore" to anything you prefer– it is only used in this codebase.

Then run `zerve-sync`. This will create `./zerve/DemoStore/*` Typescript client code in your project, which you should check in to your codebase:

```
yarn zerve-sync
```

You may also add the `prepare` script to your package, so that the sync happens automatically when you run `yarn`.

```json title="package.json"
  "scripts": {
    "prepare": "yarn zerve-sync",
```

## Set up Zerve Client

Before we use the client, we need to set up the QueryClient for React Query.

```tsx title="App.tsx"
import { QueryClient, QueryClientProvider } from "react-query";

function Home() {
  ...
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}
```

### Use the Zerve Client in your App

Now you're ready to use your Zerve store from your app. The demo store has a "Banner" Entry with a text schema. Here's an example where we display it from the index page:

```tsx name="App.tsx"
import { QueryClient, QueryClientProvider } from "react-query";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { QueryClient, QueryClientProvider } from "react-query";
// useBanner is available because the Store has a "Banner" Entry
import { useBanner } from "../zerve/DemoStore";

function Home() {
  const { data, isLoading } = useBanner({
    // pass any React Query options here, such as "onError":
    onError: (err) => alert(err),
  });
  return (
    <View style={styles.container}>
      {isLoading ? <ActivityIndicator /> : null}
      <Text style={styles.banner}>{data}</Text>
    </View>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  banner: {
    fontSize: 32,
  },
});
```

Run the app with `yarn ios` or `yarn android`, and the app should launch with the "Banner" content loaded from the [demo store API](https://alpha.zerve.app/.z/store/ev/demo/state/Banner/value).

Now you have a type-safe way to load content from the Zerve Store! At this point you may add entries and schemas to your store, and re-run `yarn zerve-sync` to update your client.

See [Client](./client) for more details on the client.

### Zerve Content

You may optionally use Zerve's `react-native-content` presentation components for displaying content to the user. Currently the only one included is [`<HumanText />`](./human-text).

First, install it:

```
yarn add @zerve/react-native-content
```

In the demo store, we have added a "Headline" entry set to the HumanText schema.

Now you are ready to render `<HumanText />` in your app. Modify it with the following:

```tsx file="App.tsx"
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

Run the app with `yarn ios` or `yarn android`, and the app should launch with the "Headline" content loaded from the [demo store API](https://alpha.zerve.app/.z/store/ev/demo/state/Headline/value).

See [HumanText](./human-text) for more details on this component.
