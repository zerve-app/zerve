1. Sign up for Zerve, or self-host a server
2. Within your Zerve store:
   a. Specify JSON-Schema within your store
   b. Add initial data
3. Within your Web or React Native App:
   a. npm install `@zerve/client`, install -D `@zerve/cli`
   b. configure your repo (package.json or config file) with URL of your server
   c. introduce `zerve sync` action in package.json postinstall
   d. useZerve in your app to consume data from the API
