---
title: Client
---

The Client is automatically created by the [Zerve CLI](./cli). But you can also install and use it directly.

> Warning: This API may change in the coming months while Zerve is in alpha. To avoid breaking changes, use the CLI workflow directly, and update @zerve/cli and @zerve/client at the same time.

## Installation

```
yarn add @zerve/client
```

This library depends on [React Query](https://www.npmjs.com/package/react-query) as a required peer dependency. This means you need to install it yourself:

```
yarn add react-query
```

## Usage

```tsx
import { createZStoreClient } from "@zerve/client/StoreClient";

export const zClient = createZStoreClient(
  "https://", // protocol
  "alpha.zerve.app", // host
  ".z/store/my-user-or-organization/my-store-name", // path
);
```
