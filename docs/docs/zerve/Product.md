---
title: Zerve Problem + Solution Proposal
---

# Problem + Solution Approach

Zerve is a Content System that helps you adjust settings in your app, after it has been deployed.

## Problem Statement

Traditionally, developers of web and mobile apps have two ways to make changes to their application once it has been deployed:

A. Change the code and re-deploy the app (then wait for your users to update or refresh)
B. If your app has a database for user data, make changes to that database, if your app is set up to handle those changes

Sometimes your team wants to make changes to your running app, without re-deploying or affecting the user database.

For example, maybe you want to occasionally prevent new users from signing up to your service. Your app needs some value called "AllowNewUsers" that your non-technical team can toggle.

### Problem 1: Waste of developer time!

While (A)Re-Deployment is always an option, it is a slow and fragile process that takes up the valuable time of your development team. And (B)Database can work well, but it requires complicated upfront setup and development time.

### Problem 2: This prevents your non-technical team from making changes to the app!

With any strategy, your non-technical team needs the ability to modify your app safely, without accidentally breaking things.

### A Solution? Headless Content Management System?

One potential solution to these problems is a "Headless CMS", a simple database for your app's configuration. This generally allows your non-technical team to use a seperate app to modify content and settings which can be picked up by your app in production.

These solutions have a few common shortcomings. First of all, your non-technical team needs a dashboard allows them to _safely_ modify the settings of the app. Often there are constraints that you need to carefully communicate to your team, so they can make changes without breaking the production app. This issue also affects developers, because their code will make certain assumptions about the data in the CMS, and the app may crash if those assumptions are broken.

The other primary shortcoming is the nature of a 'headless' CMS, where your developers are expected to build the presentation logic from scratch (the "head" is built by your developers every time). If your team wants to present arbitrary content to the user in some circumstances, the developer wastes time writing the presentation code for that content.

### Our Solution, Zerve: A Headful Content Management System

Zerve is a Content Management System which aims to address the common shortfalls of the Headless CMS. The following workflow details the way you can use Zerve to define a schema for your config db, so your non-technical team can manage app data according to your specification. Then the Zerve client can give you a type-safe interface using TypeScript.

# The Zerve Workflow

This workflow encourages you to maintain a 3rd "source-of-truth" for your company's data, in addition to your codebase (in git), and your user data (in your database). Your team will maintain a new configuration database in the Zerve service, or you can self-host it.

Most likely, your organization will only need one config db, which will be shared across development, staging, and production. If you need different behavior across these environments, your code may access different values within the config db.

## Set up a Zerve Server + Store

You will need a host for your config db, and you can use the Zerve service directly to create your own Store, or you may choose to self-host Zerve on your own server.

## Add Initial Data and Schema

You can use the Zerve app to create a new File within your store, and set the Schema for the file. The Schema can be any JSON-Schema. The app also allows you to add custom re-usable Schemas within your Store.

For this example, we can create an `AllowNewUsers` file in our store, with the schema of `{"type": "boolean"}`.

## Connect the Store to your Codebase

### 1. Add Zerve dependencies to your app:

- Install the client with `yarn add @zerve/client`
- Install the dev tools with `yarn add -D @zerve/cli`

### 2. In your app's package.json, add the following:

```json
  "zerve": {
    "dynamicSync": {
      "my-zerve-store": "https://zerve.app/my-user/my-store"
    }
  }
```

You may replace `https://zerve.app` with the host of your own Zerve Server, if you are self hosting. You may replace `my-user/my-store` with the path of your Store on the Zerve Server. You can rename `my-zerve-store` to anything– your code will refer to this value.

### 3. Run `yarn zerve-sync`, the command that you have already installed from `@zerve/cli`

This will copy the schema and initial values from your configured store into `./zerve/my-zerve-store`. This directory should be included in the git repo and your deployment.

You may also want to include `"prepare": "zerve-sync"` within your `package.json` `"scripts":`, so that the sync automatically happens when you run `yarn`.

### 4. Now your application may query for the data.

```tsx
import { AllowNewUsers } from "../zerve/my-zerve-store";

export default function MyComponent() {
  // uses react-query under the hood, and you can configure it as such.
  const { data: allowSignUp } = AllowNewUsers.use();
  return <>
    {allowSignUp && <SignUpButton />}
```

Because the CLI syncronized our schemas, TypeScript knows that `allowSignUp` is a boolean.

Or you can manually "get" the value from your database:

```tsx
import { AllowNewUsers } from "../zerve/my-zerve-store";

const isAllowed = await AllowNewUsers.get();
```

## Deploy your Application

Build and deploy the app with your normal deployment workflow. This should include the new `zerve` directory that has been added to your codebase, which contains schema metadata and the initial/current values from your Zerve Store.

## Problem solved! (Mostly!)

Now your non-technical team can log into the Zerve app and modify the 'AllowNewUsers' value in your store, to allow or disallow new sign-ups without waiting for the technical team or waiting for a deployment.

## Schema Locking (Reccomended!)

Now in theory it is possible to break your application by changing the schema. The app expects `AllowNewUsers` to be a boolean, and things will break if it becomes something else. You should lock the schema for this "AllowNewUsers" file, to prevent an accidental change in schema while your app is deployed.

Eventually we may support a workflow where code from your "main" branch is synced back into the Zerve Store, so that schemas are automatically locked when you start using them.
