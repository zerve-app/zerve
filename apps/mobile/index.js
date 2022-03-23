import "expo-asset";
import { registerRootComponent } from "expo";
import * as SystemUI from "expo-system-ui";

import App from "./app/App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// SystemUI.setBackgroundColorAsync("#ff0000")
//   .then(() => {
//     console.error("Done with setBackgroundColorAsync");
//   })
//   .catch((e) => {
//     console.error("Failed to setBackgroundColorAsync", e);
//   });
