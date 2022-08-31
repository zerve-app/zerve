---
title: Self Hosting
---

This document explains how to **build** and **run** Zerve, but there is **no complete guidance here for actually self-hosting**. If you decide to self-host, you are expected to make those decisions for yourself.

Do not file issues outside the scope of building and running the app. You are welcome to publish companion documentation or tools for running Zerve in different environments. Tag [@ZerveApp on Twitter](https://twitter.com/ZerveApp) and we would be happy to re-tweet it.

Please reach out on Discord or Twitter DM if your organization wants to pay for higher levels of support on your own infrastructure.

## Overview

There are at least 3 "setups" of Zerve:

- [Aardvark](#aardvark) – an internal service (not documented)
- [Bear](#bear-standalone) – a standalone instance of Zerve with a single store and no authentication
- [Zebra](#zebra-multi-tenant) – the multi-tenant Zerve service with users and organizations

Each of these setups has it's own back-end Node.js server, and a companion Next.js front-end app. `zoo-web` is meant to be a general purpose front-end, although Zebra has `zebra-web` as the Next.js app.

All of these servers live in the repo's `/apps`, but they have huge amounts of shared code in `/packages`.

> There is also "apps/yak", the homepage for zerve.app, but this is a statically-rendered Next app and isn't really a Zerve service. Plus "docs", the Docusaurus source for docs.zerve.app

## Dependencies & Setup

Your computer will need Node.js 16 and Yarn 1.x.

Start by checking out the repo and installing dependencies via yarn.

```
git clone --depth=1 /root/zerve.git z-build-dir
cd z-build-dir
yarn --frozen-lockfile
```

Copy the secrets file from `secrets.template.json` into `secrets.json` and change the secrets that your services require.

> The service runs on systemd services in Debian 11, and uses Caddy 2 as the reverse proxy and HTTPS provider. The CDN is provided by CloudFlare. But these details are outside the scope of this document and Zerve should work in other environments

## Bear (Standalone)

The standalone server with no Authentication and a single Store.

### Build Bear

```
cd z-build-dir
yarn workspace zoo-server-standalone build
yarn workspace zoo-web build
```

### Env Variables

`zoo-server-standalone` env variables:

- `NODE_ENV` - mode: "dev" or "production"
- `HOME` - user's home directory (only used as a default for $ZERVE_DATA_DIR)
- `ZERVE_DATA_DIR` - the local path for user data, auth data, and logs (default is $HOME/.zerve in production and $CWD/dev-data in dev)
- `ZERVE_SECRETS_JSON` - the path of the secrets.json file, (default `z-build-dir/secrets.json`)
- `PORT` - what port to bind to (default 3888)

`zoo-web` env variables:

- `NODE_ENV` - mode: "dev" or "production"
- `Z_ORIGIN` - the URL to access the zoo-server-standalone (eg "http://localhost:3888")
- `PORT` - what port to bind to
- `Z_STORE_TITLE` - title to display for the single store

### Run Bear

The `zoo-server-standalone` only handles paths under `/.z`. To start it:

```
cd z-build-dir
node apps/zoo-server-standalone/build/ZooServerStandalone.js
```

And `zoo-web` handles the rest of public web paths. To start it:

```
cd z-build-dir/apps/zoo-web
../../node_modules/.bin/next start
```

## Zebra (Multi-Tenant)

The multi-tenant Zerve service with Auth, Logging, Users, Organizations, and user-managed Stores.

Uses `apps/zebra-server` for the back-end node.js server and `apps/zebra-web` for the front end Next.js app.

### Build Zebra

```
cd z-build-dir
yarn workspace zebra-web build
yarn workspace zebra-server build
```

### Env Variables

`zebra-server` env variables:

- `NODE_ENV` - mode: "dev" or "production"
- `HOME` - user's home directory (only used as a default for $ZERVE_DATA_DIR)
- `ZERVE_DATA_DIR` - the local path for user data, auth data, and logs (default is $HOME/.zerve in production and $CWD/dev-data in dev)
- `ZERVE_SECRETS_JSON` - the path of the secrets.json file, (default `z-build-dir/secrets.json`)
- `PORT` - what port to bind to (default 3888)
- `FROM_EMAIL` - email to send from, through SendGrid (default "Zerve Admin <admin@zerve.app>")

`zebra-web` env variables:

- `NODE_ENV` - mode: "dev" or "production"
- `Z_ORIGIN` - the URL to access the zebra-server (eg "http://localhost:3888")
- `PORT` - what port to bind to

### Secrets

You should provide the following keys a JSON file in `z-build-dir/secrets.json` or `$ZERVE_SECRETS_JSON`. You can use `secrets.template.json` as a starting point.

For email authentication:

- SendgridKey

For phone authentication:

- TwilioAccountSid
- TwilioKeySid
- TwilioKeySecret
- TwilioFromNumber

> If you login via Email in NODE_ENV=dev, the code will be printed to the console. This allows you to test Zebra without any secrets at all 😁

### Public Build Data

Zebra exposes any public build metadata you put into `z-build-dir/build.json`

This will be exposed at `http://localhost:$PORT/.z/buildInfo`

### Run Zebra

The `zebra-server` only handles paths under `/.z`. To start it:

```
cd z-build-dir
node apps/zebra-server/build/ZebraServer.js
```

And `zebra-web` handles the rest of public web paths. To start it:

```
cd z-build-dir/apps/zebra-web
../../node_modules/.bin/next start
```

## Aardvark

Sorry, not documented yet. This is an internal service for staging and depoying Zebra. (yes, we deploy from A-Z 😂)
