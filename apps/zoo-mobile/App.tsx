import React from "react";
import { ZooAppNavigation } from "@zerve/zoo/app/NativeNavigation";
import { ToastArea, ZenProvider } from "@zerve/zen";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaContextProvider } from "@zerve/zen";

// it appears that android doesn't have this built-in function
if (!String.prototype.replaceAll) {
  console.warn("String.prototype.replaceAll is missing");
  // can you keep this hack a secret, between you and me?
  String.prototype.replaceAll = function (find, replace) {
    return this.split(find).join(replace);
  };
}

if (!Array.prototype.at) {
  console.warn("Array.prototype.at is missing");
  Array.prototype.at = function (index) {
    // handle negative indexes:
    if (index < 0) {
      index = this.length + index;
    }
    return this[index];
  };
}

export default function App() {
  return (
    <SafeAreaContextProvider>
      <ZenProvider>
        <ToastArea />
        <ZooAppNavigation />
      </ZenProvider>
    </SafeAreaContextProvider>
  );
}
