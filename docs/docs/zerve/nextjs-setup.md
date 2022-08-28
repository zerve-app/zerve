Guided setup for Zerve + Typescript + React Native Web in a Next app

### Create a Next.js App

npx create-next-app example-web-app

### Add React-Native-Web

add support for RNW, based on https://github.com/vercel/next.js/blob/canary/examples/with-react-native-web/

this is how to add support manually. Alternatively you can:

- Use the Expo workflow to add RNW support to your app: https://docs.expo.dev/guides/using-nextjs/
- Use the Next.js starter https://github.com/vercel/next.js/tree/canary/examples/with-expo-typescript or https://github.com/vercel/next.js/tree/canary/examples/with-expo

copy `next.config.js` from "with-react-native-web"

yarn add react-native-web
yarn add -D babel-plugin-react-native-web

copy `babel.config.js` from "with-react-native-web"

copy `pages/\_app.js` from "with-react-native-web"
copy `pages/\_document.js` from "with-react-native-web"

copy `app.json` from "with-react-native-web"

### Set up TypeScript

yarn add -D typescript
yarn add --dev @types/react @types/node @types/react-native

rename pages/index.js to index.tsx

import React from 'react'

next sees that you're using TS, so it auto-creates the tsconfig.json with the following:

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

yarn add @zerve/client
yarn add -D @zerve/client

### Zerve Content

yarn add @zerve/react-native-content
