---
title: Zerve CLI
---

```
yarn add -D @zerve/cli
```

This package provides the `zerve-sync` command, which will set up the client for your app, as long as you have it installed.

Files will be generated in the `./zerve` directory, and **you should check these files in to your codebase** because they are tightly linked with your code.

> Note: This API is likely to change while Zerve is in alpha. For example, we may switch to `zerve sync` and offer other sub-commands

## Zerve `package.json` Setup

The CLI requires a "zerve" field in your app's package.json. An example:

```
  "zerve": {
    "dynamicSync": {
      "DemoStore": "https://alpha.zerve.app/.z/store/user-1/store1",
      "SelfStore": "https://zerve.self.hosted/.z/store/user-2/store2"
    }
  }
```

To make sure the sync happens frequently, set it up as a prepare script so it automatically happens when you run `yarn`

```
  "scripts": {
    "prepare": "zerve-sync"
  },
```

### `dynamicSync`

This tells Zerve to set up the client to download content from the Store within your app's client.

```
  "LocalName": "https://store/url"
```

### `staticSync`

Coming Soon, this will tell the CLI to grab content from the store and save JSON into your codebase for you to access at build time.

> Note: for now you can statically access all "dynamicSync" content at `zerve/LocalStoreName/data-sync.json, but this may change in a future release
