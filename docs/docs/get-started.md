---
title: Get Started
sidebar_position: 2
---

Zerve is a Content System which [aims to address the common shortfalls of the Headless CMS](intro). The following workflow details the way you can use Zerve to define a schema for your Store, so your non-technical team can manage app data according to your specification. Then the Zerve client can give you a type-safe interface using TypeScript.

- [React Native Getting Started Guide](./zerve/nextjs-setup)
- [Next.js Getting Started Guide](./zerve/react-native-setup)

# The Zerve Workflow

Your organization probably has at least two "sources of truth" for your data: the codebase (in git), and your user data (in your database).

This workflow encourages you to maintain a 3rd "source-of-truth" for your company's data. Your team will own data in a Zerve Content Store.

Most likely, your organization will only need one Store, which will be shared across development, staging, and production. If you need different behavior across these environments, your code may access different values within the Store. It is recommended to use one Store for your project, so the schemas may be shared across environments.

## Set up a Zerve Server + Store

You will need a host for your Store, and you can use the [Zerve service](https://alpha.zerve.app) directly to create your own Store, or you may choose to [self-host](./zerve/self-host) Zerve on your own server.

## Add Initial Data and Schema

You can use the Zerve app to create a new Entry within your store, and set the Schema for the entry. The Schema can be any JSON-Schema. The app also allows you to add custom re-usable Schemas within your Store.

For this example, we can create an `AllowNewUsers` entry in our store, with the schema of `{"type": "boolean"}`.

## Connect the Store to your Codebase

### 1. Add Zerve Dependencies

- Install the dev tools with `yarn add -D @zerve/cli`
- Install the client with `yarn add @zerve/client`. This also requires React Query `yarn add react-query`

### 2. Set Up your App's package.json:

```json
  "zerve": {
    "dynamicSync": {
      "my-zerve-store": "https://alpha.zerve.app/.z/store/my-user/my-store"
    }
  }
```

You may replace `https://zerve.app/my-user/my-store` with the host and path of your Zerve server and store path. You can rename `my-zerve-store` to anything– your code will refer to this value.

### 3. Run `yarn zerve-sync`

The `zerve-sync` command, provided by `@zerve/cli`, will copy the schema and initial values from your configured store into `./zerve/my-zerve-store`. This directory should be included in the git repo and your deployment.

You may also want to include `"prepare": "zerve-sync"` within your `package.json` `"scripts":`, so that the sync automatically happens when you run `yarn`.

### 4. Your App can Query from the Store

```tsx
import { useAllowNewUsers } from "../zerve/my-zerve-store";

export default function MyComponent() {
  const { data: allowSignUp } = useAllowNewUsers({
    // uses react-query under the hood, and you can configure it as such.
  });
  return <>
    {allowSignUp && <SignUpButton />}
```

Because the CLI syncronized the schemas, TypeScript knows that `allowSignUp` is a boolean.

Or you can manually "get" the value from your Store:

```tsx
import { AllowNewUsers } from "../zerve/my-zerve-store";

const isAllowed = await AllowNewUsers.get();
```

### 4. Your App can Present Content from the Store

React Native apps can install `@zerve/react-native-content` to utilize the built-in views.

Within your Store Settings on the dashboard, enable the schema that you want to use, for example `HumanText`. Then you may create an entry or schema called "Banner", for example, using the `HumanText` schema.

Run `zerve-sync` again, or just run `yarn` if you have the "prepare" script set up.

```tsx
import { HumanText } from "@zerve/react-native-content/HumanText";
import { useBanner } from "../zerve/my-zerve-store";

function App() {
  const { data } = useBanner();
  return <HumanText value={data} />;
}
```

## Deploy your App

Build and deploy the app with your normal deployment workflow. This should include the new `zerve` directory that has been added to your codebase, which contains schema metadata and the initial/current values from your Zerve Store.

## Problem solved! (Mostly!)

Now your non-technical team can log into the Zerve app and modify the 'AllowNewUsers' or 'Banner' values.

Soon we will add the capability of locking the schema in your Zerve store, to prevent breaking changes in your data.
