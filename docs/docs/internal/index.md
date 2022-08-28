# Welcome, Contributors

For small fixes, feel free to [send a pull request directly](https://github.com/zerve-app/zerve/pulls)

To contribute larger feature work, please get in touch with Eric on Twitter or Discord.

## First Steps

You will need GitHub ssh setup, yarn 1.x, and NodeJS 16 LTS.

1. Check out the repo: `git clone --depth=1 git@github.com:zerve-app/zerve.git`
2. Install dependencies: `yarn`
3. Run the (simple) web app + server: `yarn dev`

This should launch the API server from `apps/zoo-server-standalone` on localhost:3888 and the NextJS `apps/zoo-web` on localhost:3000

## Show me the Code!

There are a number of apps/packages/projects in the [Zerve Monorepo](https://github.com/zerve-app/zerve). These are the most important:

- [apps/zoo-mobile](https://github.com/zerve-app/zerve/tree/main/apps/zoo-mobile) - Zerve's main React Native (Expo) mobile app
- [apps/zoo-web](https://github.com/zerve-app/zerve/tree/main/apps/zoo-web) - Zerve's default NextJS web app
- [apps/zoo-server-standalone](https://github.com/zerve-app/zerve/tree/main/apps/zoo-server-standalone) - The "starter" API server with no auth, and one Store
- [apps/zebra-web](https://github.com/zerve-app/zerve/tree/main/apps/zebra-web) - The Zerve.app NextJS app
- [apps/zebra-server](https://github.com/zerve-app/zerve/tree/main/apps/zebra-server) - The Zerve.app API server
- [apps/aardvark-server](https://github.com/zerve-app/zerve/tree/main/apps/aardvark-server) - The Internal Zerve API server

All of the `@zerve/x` references can be found in [`packages/x`](https://github.com/zerve-app/zerve/tree/main/packages). These are the most important:

- [packages/zed](https://github.com/zerve-app/zerve/tree/main/packages/zed) - API Logic shared on the full stack
- [packages/zoo](https://github.com/zerve-app/zerve/tree/main/packages/zoo) - Code shared between the web and native apps
- [packages/zen](https://github.com/zerve-app/zerve/tree/main/packages/zen) - UI library for web and native apps

You can ignore the unimportant/experimental apps and packages, or ask Eric about them.

## Dev the Zerve Service

This requires a SendGrid account to send emails, and a Twilio account for phone authentication.

- Copy the `secrets.template.json` to `secrets.json` and add your secret tokens
- Run the production service, codenamed Zebra: `yarn dev:zebra`

## Internal Docs in Progress:

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```
