Guided setup for Zerve + Typescript + React Native Web in a Next app

This is the manual guide. Alternatively you can:

- [Use the Expo workflow to add RNW support to your Next app](https://docs.expo.dev/guides/using-nextjs/)
- [Use the Next.js starter](https://github.com/vercel/next.js/tree/canary/examples/with-expo-typescript) - but be forwarned! This seems to be out of date

### Create a Next.js App

npx create-next-app example-web-app

### Add React-Native-Web

add support for RNW, based on https://github.com/vercel/next.js/blob/canary/examples/with-react-native-web/

copy `next.config.js` from "with-react-native-web"

yarn add react-native-web
yarn add -D babel-plugin-react-native-web

copy `babel.config.js` from "with-react-native-web"

copy `pages/\_app.js` from "with-react-native-web"
copy `pages/\_document.js` from "with-react-native-web"

copy `app.json` from "with-react-native-web"

### Set up TypeScript

First, install the relevant typescript packages:

`yarn add -D typescript @types/react @types/node @types/react-native`

Then, rename `pages/index.js` to `index.tsx`. At the top of this file, add `import React from 'react'` or else TS will get confused.

If you restart your server, Next sees that you're using TS, and it auto-creates a `tsconfig.json` for you.

Then, set `"moduleResolution": "node"` so that TS can see the definition files of modules we install.

Now, your `tsconfig.json` should look like this:

```
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
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
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

Great, now the app supports React Native Web and TypeScript! You're ready to install Zerve.

### Set up Zerve

`yarn add -D @zerve/cli`

add to package.json:

```
zerve: ...
```

now run `yarn zerve-sync`

`yarn add react-query @zerve/client`

```
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

### Zerve Content

yarn add @zerve/react-native-content
