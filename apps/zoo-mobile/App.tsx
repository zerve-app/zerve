import React from "react";
import { ZooAppNavigation } from "@zerve/zoo/app/NativeNavigation";
import { ToastArea, ZenProvider } from "@zerve/zen";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaContextProvider } from "@zerve/zen";

// it appears that android doesn't have this built-in function
if (!String.prototype.replaceAll) {
  // can you keep this hack a secret, between you and me?
  String.prototype.replaceAll = function (find, replace) {
    return this.split(find).join(replace);
  };
}

export default function App() {
  return (
    <SafeAreaContextProvider>
      <ZenProvider>
        <NavigationContainer>
          <ToastArea />
          <ZooAppNavigation />
        </NavigationContainer>
      </ZenProvider>
    </SafeAreaContextProvider>
  );
}
