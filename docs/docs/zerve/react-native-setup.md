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

## Coming Soon

Same steps as described in [Zerve Workflow](../workflow).
